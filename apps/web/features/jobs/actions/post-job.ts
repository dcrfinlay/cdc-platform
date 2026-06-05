'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { JobType } from '@/lib/types/database.types'

export type PostJobState = { error?: string }

export async function postJob(
  _prev: PostJobState,
  formData: FormData
): Promise<PostJobState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify employer is approved
  const { data: employer } = await supabase
    .from('employers')
    .select('id, approved')
    .eq('id', user.id)
    .single()

  if (!employer?.approved) return { error: 'Your employer account is pending approval.' }

  const title       = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const type        = formData.get('type') as JobType
  const location    = (formData.get('location') as string) || null
  const isRemote    = formData.get('is_remote') === 'true'
  const salaryRange = (formData.get('salary_range') as string) || null
  const deadline    = (formData.get('deadline') as string) || null
  const publish     = formData.get('publish') === 'true'

  if (!title || !type) return { error: 'Title and type are required.' }

  const { data, error } = await supabase.from('jobs').insert({
    employer_id:  user.id,
    title,
    description,
    type,
    location,
    is_remote:    isRemote,
    salary_range: salaryRange,
    deadline,
    status:       publish ? 'published' : 'draft',
  }).select('id').single()

  if (error || !data) return { error: 'Failed to post job. Please try again.' }

  redirect(`/employer/jobs/${data.id}?created=1`)
}
