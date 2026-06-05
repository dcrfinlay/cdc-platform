'use server'

import { createClient } from '@/lib/supabase/server'

export type ForgotPasswordState = {
  error?: string
  success?: boolean
}

export async function forgotPassword(
  _prev: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = formData.get('email') as string

  if (!email) return { error: 'Email is required.' }

  const supabase = await createClient()

  // redirectTo sends the user to /auth/callback?next=/reset-password
  // which exchanges the recovery code for a session then lands on the
  // reset-password page where they can set a new password.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/reset-password`,
  })

  // Always return success — never reveal whether the email exists
  return { success: true }
}
