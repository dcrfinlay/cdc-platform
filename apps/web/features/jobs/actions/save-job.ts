'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleSaveJob(jobId: string, currentlySaved: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  if (currentlySaved) {
    await supabase.from('saved_jobs')
      .delete()
      .eq('job_id', jobId)
      .eq('student_id', user.id)
  } else {
    await supabase.from('saved_jobs')
      .insert({ job_id: jobId, student_id: user.id })
  }

  revalidatePath('/student/jobs/[id]', 'page')
  revalidatePath('/student/jobs/saved', 'page')
  return { success: true }
}
