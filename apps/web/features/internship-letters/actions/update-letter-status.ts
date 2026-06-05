'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { notify } from '@/features/notifications/lib/notify'
import type { LetterStatus } from '@/lib/types/database.types'

const ALLOWED_TRANSITIONS: Record<LetterStatus, LetterStatus[]> = {
  submitted:    ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved:     ['collected'],
  rejected:     [],
  collected:    [],
}

const NOTIFY_MAP: Partial<Record<LetterStatus, { title: string; body: string }>> = {
  under_review: { title: 'Your internship letter is under review', body: 'The CDC team has started reviewing your request.' },
  approved:     { title: 'Your internship letter is ready', body: 'Your letter has been approved and is ready for collection or dispatch.' },
  rejected:     { title: 'Internship letter request update', body: 'Your letter request could not be processed. Please check the details and contact CDC.' },
  collected:    { title: 'Internship letter marked as collected', body: 'Your internship letter has been marked as collected.' },
}

export type UpdateStatusState = { error?: string }

export async function updateLetterStatus(
  _prev: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') return { error: 'Unauthorised.' }

  const letterId   = formData.get('letter_id') as string
  const newStatus  = formData.get('status') as LetterStatus
  const staffNotes = (formData.get('staff_notes') as string) || null

  const { data: letter, error: fetchError } = await supabase
    .from('internship_letters')
    .select('status, student_id')
    .eq('id', letterId)
    .single()

  if (fetchError || !letter) return { error: 'Letter not found.' }

  const allowed = ALLOWED_TRANSITIONS[letter.status as LetterStatus] ?? []
  if (!allowed.includes(newStatus)) {
    return { error: `Cannot move from "${letter.status}" to "${newStatus}".` }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('internship_letters')
    .update({
      status:      newStatus,
      staff_notes: staffNotes,
      reviewed_by: user.id,
      reviewed_at: now,
      ...(newStatus === 'collected' ? { collected_at: now } : {}),
    })
    .eq('id', letterId)

  if (error) return { error: 'Failed to update status. Please try again.' }

  // Notify student
  const notif = NOTIFY_MAP[newStatus]
  if (notif) {
    await notify({
      userId: letter.student_id,
      type:   `letter_${newStatus}` as any,
      title:  notif.title,
      body:   staffNotes ? `Staff note: ${staffNotes}` : notif.body,
      link:   '/student/letters',
    })
  }

  redirect(`/staff/letters/${letterId}?updated=1`)
}
