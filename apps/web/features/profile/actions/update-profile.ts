'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type UpdateProfileState = { error?: string; success?: boolean }

export async function updateStudentProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const full_name     = formData.get('full_name')     as string
  const phone         = formData.get('phone')         as string | null
  const faculty       = formData.get('faculty')       as string | null
  const year_of_study = formData.get('year_of_study') as string | null
  const graduation_year_raw = formData.get('graduation_year') as string | null
  const degree        = formData.get('degree')        as string | null
  const skills_raw    = formData.get('skills')        as string | null

  if (!full_name) return { error: 'Full name is required.' }

  const graduation_year = graduation_year_raw ? parseInt(graduation_year_raw, 10) : null
  const skills = skills_raw
    ? skills_raw.split(',').map(s => s.trim()).filter(Boolean)
    : []

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      phone:           phone           || null,
      faculty:         faculty         || null,
      year_of_study:   year_of_study   || null,
      graduation_year: graduation_year || null,
      degree:          degree          || null,
      skills,
    })
    .eq('id', user.id)

  if (error) return { error: 'Failed to update profile.' }

  revalidatePath('/student/profile')
  revalidatePath('/student/dashboard')
  return { success: true }
}

export async function updateEmployerProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated.' }

  const full_name    = formData.get('full_name')    as string
  const company_name = formData.get('company_name') as string
  const industry     = formData.get('industry')     as string | null
  const website      = formData.get('website')      as string | null
  const company_size = formData.get('company_size') as string | null
  const contact_title = formData.get('contact_title') as string | null

  if (!full_name || !company_name) return { error: 'Full name and company name are required.' }

  await Promise.all([
    supabase.from('profiles').update({ full_name }).eq('id', user.id),
    supabase.from('employers').update({
      company_name,
      industry:      industry      || null,
      website:       website       || null,
      company_size:  company_size  || null,
      contact_title: contact_title || null,
    }).eq('id', user.id),
  ])

  revalidatePath('/employer/profile')
  revalidatePath('/employer/dashboard')
  return { success: true }
}
