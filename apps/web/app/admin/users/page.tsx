import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { RoleSelect } from './_actions'
import type { UserRole } from '@/lib/types/database.types'

const ROLE_STYLE: Record<UserRole, { bg: string; color: string }> = {
  student:  { bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  employer: { bg: 'var(--green-light)',  color: 'var(--green)'  },
  staff:    { bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  admin:    { bg: 'var(--purple-light)', color: 'var(--purple)' },
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

  const { data: { users: authUsers } } = await admin.auth.admin.listUsers()
  const emailMap = Object.fromEntries((authUsers ?? []).map(u => [u.id, u.email]))

  const roleCounts = (profiles ?? []).reduce<Record<string, number>>((acc, p) => {
    acc[p.role] = (acc[p.role] ?? 0) + 1; return acc
  }, {})

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">User management</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">{profiles?.length ?? 0} users</p>
      </div>

      {/* Role summary chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(roleCounts) as [UserRole, number][]).map(([role, count]) => {
          const { bg, color } = ROLE_STYLE[role] ?? ROLE_STYLE.student
          return (
            <div key={role} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold" style={{ background: bg, color }}>
              <span className="capitalize">{role}</span>
              <span className="opacity-70">· {count}</span>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden md:table-cell">Faculty</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Role</th>
              <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden sm:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((profile, i) => {
              const { bg, color } = ROLE_STYLE[profile.role as UserRole] ?? ROLE_STYLE.student
              return (
                <tr key={profile.id}
                  className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''}`}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{profile.full_name ?? '—'}</div>
                    <div className="text-[11px] text-[var(--muted)]">{emailMap[profile.id] ?? ''}</div>
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden md:table-cell">
                    {[profile.faculty, profile.year_of_study].filter(Boolean).join(' · ') || '—'}
                  </td>
                  <td className="px-5 py-4">
                    {profile.id === user.id ? (
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full capitalize" style={{ background: bg, color }}>
                        {profile.role}
                      </span>
                    ) : (
                      <RoleSelect userId={profile.id} currentRole={profile.role as UserRole} />
                    )}
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden sm:table-cell">
                    {new Date(profile.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
