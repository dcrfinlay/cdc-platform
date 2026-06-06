'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getRoleDashboard } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
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
  const email      = formData.get('email') as string
  const password   = formData.get('password') as string
  const fullName   = formData.get('full_name') as string
  const role       = (formData.get('role') as UserRole) ?? 'student'
  const companyName = formData.get('company_name') as string | null

  if (!email || !password || !fullName) {
    return { error: 'All fields are required.' }
  }
  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }
  if (role === 'staff' || role === 'admin') {
    return { error: 'Invalid role.' }
  }
  if (role === 'employer' && !companyName) {
    return { error: 'Company name is required for employer accounts.' }
  }

  const { allowed, retryAfter } = await checkRateLimit('signup')
  if (!allowed) {
    const mins = Math.ceil((retryAfter ?? 3600) / 60)
    return { error: `Too many sign-up attempts. Please wait ${mins} minute${mins !== 1 ? 's' : ''} and try again.` }
  }

  // Check for existing account using admin client (avoids leaking info via timing)
  const admin = createAdminClient()
  const { data: existingUsers } = await admin.auth.admin.listUsers()
  const alreadyExists = existingUsers?.users.some(
    u => u.email?.toLowerCase() === email.toLowerCase()
  )
  if (alreadyExists) {
    return {
      error:
        'An account with this email already exists. ' +
        'Please sign in or use "Forgot password?" to reset your password.',
    }
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
    return { error: error.message }
  }

  if (!data.user) {
    return { success: true }
  }

  // Create employer record
  if (role === 'employer' && companyName && data.user) {
    await admin.from('employers').insert({
      id:           data.user.id,
      company_name: companyName,
      approved:     false,
    })
  }

  // Session available immediately (email confirmation disabled)
  if (data.session) {
    redirect(getRoleDashboard(role))
  }

  return { success: true }
}
