import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { RoleSelect } from './_actions'
import type { UserRole } from '@/lib/types/database.types'

const ROLE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  student:  { bg: '#E6F1FB', color: '#185FA5' },
  employer: { bg: '#E1F5EE', color: '#0F6E56' },
  staff:    { bg: '#FAEEDA', color: '#854F0B' },
  admin:    { bg: '#EEEDFE', color: '#534AB7' },
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, role, full_name, faculty, year_of_study, created_at')
    .order('created_at', { ascending: false })

  // Get emails from auth.users via admin API
  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  const emailMap = Object.fromEntries((authUsers ?? []).map(u => [u.id, u.email]))

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}><button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button></form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-2">User management</h1>
        <p className="text-[13px] text-[#666] mb-6">{profiles?.length ?? 0} users</p>

        <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Faculty</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(profiles ?? []).map((profile, i) => {
                const { bg, color } = ROLE_STYLE[profile.role as UserRole] ?? ROLE_STYLE.student
                return (
                  <tr key={profile.id}
                    className={`border-b border-[#e5e4df] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold">{profile.full_name ?? '—'}</div>
                      <div className="text-[11px] text-[#888]">{emailMap[profile.id] ?? ''}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#666] hidden md:table-cell">
                      {[profile.faculty, profile.year_of_study].filter(Boolean).join(' · ') || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      {profile.id === user.id ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ bg, color } as any}>
                          {profile.role}
                        </span>
                      ) : (
                        <RoleSelect userId={profile.id} currentRole={profile.role as UserRole} />
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#888] hidden sm:table-cell">
                      {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
