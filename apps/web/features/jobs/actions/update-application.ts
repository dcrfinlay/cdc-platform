'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { ApplicationStatus } from '@/lib/types/database.types'

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus,
  employerNote?: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  await supabase.from('applications')
    .update({ status, employer_note: employerNote ?? null })
    .eq('id', applicationId)

  revalidatePath('/employer/jobs/[id]', 'page')
  return { success: true }
}
