import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [{ count: totalUsers }, { count: pendingEmployers }] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('employers').select('*', { count: 'exact', head: true }).eq('approved', false),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <form action={signOut}>
          <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">
            Sign out
          </button>
        </form>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEDFE] text-[#534AB7] text-[11px] font-bold mb-4">
          Admin
        </div>
        <h1 className="text-[24px] font-bold mb-6">Admin dashboard</h1>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white border border-[#e5e4df] rounded-xl p-5">
            <div className="text-[24px] font-bold">{totalUsers ?? 0}</div>
            <div className="text-[11px] text-[#888] mt-1">Total users</div>
          </div>
          <div className="bg-white border border-[#e5e4df] rounded-xl p-5">
            <div className="text-[24px] font-bold text-[#854F0B]">{pendingEmployers ?? 0}</div>
            <div className="text-[11px] text-[#888] mt-1">Employers pending approval</div>
          </div>
        </div>

        <p className="text-[13px] text-[#666]">
          User management, employer approvals, and CMS tools coming in Phase 4.
        </p>
      </div>
    </div>
  )
}
