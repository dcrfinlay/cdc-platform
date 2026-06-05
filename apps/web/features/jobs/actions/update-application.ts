'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { notify } from '@/features/notifications/lib/notify'
import type { ApplicationStatus } from '@/lib/types/database.types'

const NOTIFY_MAP: Partial<Record<ApplicationStatus, string>> = {
  reviewed:    'Your application is under review',
  shortlisted: 'You have been shortlisted!',
  rejected:    'Application update',
  hired:       'Congratulations — you have received an offer!',
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  employerNote?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  // Fetch application to get student_id and job title for notification
  const { data: app } = await supabase
    .from('applications')
    .select('student_id, jobs(title)')
    .eq('id', applicationId)
    .single()

  await supabase.from('applications')
    .update({ status, employer_note: employerNote ?? null })
    .eq('id', applicationId)

  // Notify student
  const title = NOTIFY_MAP[status]
  if (title && app) {
    const jobTitle = (app.jobs as any)?.title ?? 'a position'
    await notify({
      userId: app.student_id,
      type:   `application_${status}` as any,
      title,
      body:   `Regarding your application for ${jobTitle}.${employerNote ? ` Note: ${employerNote}` : ''}`,
      link:   '/student/jobs/my-applications',
    })
  }

  revalidatePath('/employer/jobs/[id]', 'page')
  return { success: true }
}
