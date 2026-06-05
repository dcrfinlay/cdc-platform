'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRoleDashboard } from '@/lib/utils'
import { redirect } from 'next/navigation'
import type { UserRole } from '@/lib/types/database.types'

export type SignUpState = {
  error?: string
  success?: boolean
}

export async function signUp(
  _prev: SignUpState,
  formData: FormData
): Promise<SignUpState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = (formData.get('role') as UserRole) ?? 'student'
  const companyName = formData.get('company_name') as string | null

  if (!email || !password || !fullName) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  // Staff and admin are not self-registerable
  if (role === 'staff' || role === 'admin') {
    return { error: 'Invalid role.' }
  }

  if (role === 'employer' && !companyName) {
    return { error: 'Company name is required for employer accounts.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists.' }
    }
    return { error: error.message }
  }

  if (!data.user) {
    return { success: true } // email confirmation required
  }

  // Create employer record using admin client (bypasses RLS during signup)
  if (role === 'employer' && companyName) {
    const admin = createAdminClient()
    await admin.from('employers').insert({
      id: data.user.id,
      company_name: companyName,
      approved: false,
    })
  }

  // If email confirmation is disabled in Supabase, session is available now
  if (data.session) {
    redirect(getRoleDashboard(role))
  }

  return { success: true }
}
