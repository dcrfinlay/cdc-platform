'use server'

import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/utils'
import { checkRateLimit } from '@/lib/rate-limit'
import { redirect } from 'next/navigation'

export type SignInState = {
  error?: string
}

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email    = formData.get('email') as string
  const password = formData.get('password') as string
  const next     = (formData.get('next') as string) || ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const { allowed, retryAfter } = await checkRateLimit('signin')
  if (!allowed) {
    const mins = Math.ceil((retryAfter ?? 900) / 60)
    return { error: `Too many sign-in attempts. Please wait ${mins} minute${mins !== 1 ? 's' : ''} and try again.` }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.message.toLowerCase().includes('email not confirmed')) {
      return {
        error:
          'Please confirm your email address before signing in. ' +
          'Check your inbox for a confirmation link.',
      }
    }
    return { error: 'Incorrect email or password. Please try again.' }
  }

  const role        = (data.user.app_metadata?.role as string) ?? 'student'
  const destination = next.startsWith('/') ? next : getRoleDashboard(role)
  redirect(destination)
}
