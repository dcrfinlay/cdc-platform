'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { LetterStatus } from '@/lib/types/database.types'

// Valid transitions — prevents arbitrary status jumps
const ALLOWED_TRANSITIONS: Record<LetterStatus, LetterStatus[]> = {
  submitted:    ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved:     ['collected'],
  rejected:     [],
  collected:    [],
}

export type UpdateStatusState = {
  error?: string
}

export async function updateLetterStatus(
  _prev: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') {
    return { error: 'Unauthorised.' }
  }

  const letterId  = formData.get('letter_id') as string
  const newStatus = formData.get('status') as LetterStatus
  const staffNotes = (formData.get('staff_notes') as string) || null

  // Fetch current status to validate transition
  const { data: letter, error: fetchError } = await supabase
    .from('internship_letters')
    .select('status')
    .eq('id', letterId)
    .single()

  if (fetchError || !letter) {
    return { error: 'Letter not found.' }
  }

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

  if (error) {
    return { error: 'Failed to update status. Please try again.' }
  }

  redirect(`/staff/letters/${letterId}?updated=1`)
}
