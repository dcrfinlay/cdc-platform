import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const role = (data.user.app_metadata?.role as string) ?? 'student'
      const destination = next.startsWith('/') ? next : getRoleDashboard(role)
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
