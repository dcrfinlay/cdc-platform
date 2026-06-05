'use server'

import { createClient } from '@/lib/supabase/server'

export type MagicLinkState = {
  error?: string
  success?: boolean
}

export async function sendMagicLink(
  _prev: MagicLinkState,
  formData: FormData
): Promise<MagicLinkState> {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Email is required.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false, // magic link is login-only; use signup form for new accounts
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Don't reveal whether the account exists
    return { success: true }
  }

  return { success: true }
}
