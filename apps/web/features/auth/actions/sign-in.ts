'use server'

import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/utils'
import { redirect } from 'next/navigation'

export type SignInState = {
  error?: string
}

export async function signIn(
  _prev: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = (formData.get('next') as string) || ''

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  const role = (data.user.app_metadata?.role as string) ?? 'student'
  const destination = next.startsWith('/') ? next : getRoleDashboard(role)
  redirect(destination)
}
