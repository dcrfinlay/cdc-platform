import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions/sign-out'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <div className="text-[14px] font-bold">Career Centre — Staff</div>
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] text-[11px] font-bold mb-4 capitalize">
          {profile?.role ?? 'Staff'}
        </div>
        <h1 className="text-[24px] font-bold mb-2">Staff dashboard</h1>
        <p className="text-[13px] text-[#666]">
          Internship letters, event management, and employer approvals coming in Phase 2–4.
        </p>
      </div>
    </div>
  )
}
