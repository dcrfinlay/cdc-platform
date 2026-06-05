'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ResetPasswordState = {
  error?: string
}

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const password = formData.get('password') as string
  const confirm  = formData.get('confirm_password') as string

  if (!password) return { error: 'Password is required.' }
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' }
  if (password !== confirm) return { error: 'Passwords do not match.' }

  const supabase = await createClient()

  // Session must already be set by the /auth/callback exchange
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Failed to update password. The reset link may have expired.' }
  }

  redirect('/login?reset=1')
}
