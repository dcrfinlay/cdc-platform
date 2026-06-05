'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ApplyJobState = { error?: string }

export async function applyToJob(
  _prev: ApplyJobState,
  formData: FormData
): Promise<ApplyJobState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const jobId      = formData.get('job_id') as string
  const coverLetter = (formData.get('cover_letter') as string) || null

  if (!jobId) return { error: 'Invalid job.' }

  const { error } = await supabase.from('applications').insert({
    job_id:       jobId,
    student_id:   user.id,
    cover_letter: coverLetter,
    status:       'submitted',
  })

  if (error) {
    if (error.message.includes('unique')) {
      return { error: 'You have already applied for this position.' }
    }
    return { error: 'Application failed. Please try again.' }
  }

  redirect(`/student/jobs/${jobId}?applied=1`)
}
