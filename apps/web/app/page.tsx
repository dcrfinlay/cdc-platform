import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getRoleDashboard } from '@/lib/utils'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    const role = (user.app_metadata?.role as string) ?? 'student'
    redirect(getRoleDashboard(role))
  }

  redirect('/login')
}
