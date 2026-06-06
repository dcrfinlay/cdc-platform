import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'
import { MobileMenu } from '@/components/mobile-menu'

const ADMIN_NAV = [
  { href: '/admin/dashboard',     label: 'Dashboard'        },
  { href: '/admin/employers',     label: 'Employers'        },
  { href: '/admin/users',         label: 'Users'            },
  { href: '/admin/announcements', label: 'Announcements'    },
  { href: '/admin/outcomes',      label: 'Outcomes'         },
  { href: '/admin/audit-log',     label: 'Audit log'        },
  { href: '/staff/letters',       label: 'Letters'          },
  { href: '/staff/events',        label: 'Events'           },
]

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  const [
    { count: totalUsers },
    { count: pendingEmployers },
    { count: totalJobs },
    { count: totalLetters },
    { data: recentLogs },
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('employers').select('*', { count: 'exact', head: true }).eq('approved', false),
    admin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('internship_letters').select('*', { count: 'exact', head: true }).in('status', ['submitted', 'under_review']),
    admin.from('audit_logs').select('action, actor_email, created_at, metadata').order('created_at', { ascending: false }).limit(8),
  ])

  const QUICK_LINKS = [
    { href: '/admin/employers',     label: 'Employer approvals',  badge: pendingEmployers ?? 0, badgeColor: '#854F0B', badgeBg: '#FAEEDA' },
    { href: '/admin/users',         label: 'User management',     badge: null },
    { href: '/admin/announcements', label: 'Announcements',       badge: null },
    { href: '/admin/outcomes',       label: 'Graduate outcomes',   badge: null },
    { href: '/admin/audit-log',     label: 'Audit log',           badge: null },
    { href: '/staff/letters',       label: 'Internship letters',  badge: totalLetters ?? 0, badgeColor: '#185FA5', badgeBg: '#E6F1FB' },
  ]

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-3">
          <form action={signOut} className="hidden sm:block">
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
          <MobileMenu items={ADMIN_NAV} userName="Admin" />
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EEEDFE] text-[#534AB7] text-[11px] font-bold mb-4">Admin</div>
        <h1 className="text-[24px] font-bold mb-8">Admin dashboard</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total users',       value: totalUsers       ?? 0, color: '#185FA5' },
            { label: 'Pending employers', value: pendingEmployers ?? 0, color: pendingEmployers ? '#854F0B' : '#888' },
            { label: 'Active jobs',       value: totalJobs        ?? 0, color: '#0F6E56' },
            { label: 'Letters pending',   value: totalLetters     ?? 0, color: totalLetters ? '#185FA5' : '#888'    },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#e5e4df] rounded-xl p-4">
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick links */}
          <div>
            <h2 className="text-[14px] font-bold mb-3">Quick access</h2>
            <div className="space-y-2">
              {QUICK_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className="flex items-center justify-between bg-white border border-[#e5e4df] rounded-xl px-5 py-3.5
                    hover:border-[#aaa] transition-colors group">
                  <span className="text-[13px] font-semibold group-hover:text-[#185FA5] transition-colors">
                    {link.label}
                  </span>
                  {link.badge != null && link.badge > 0 && (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: link.badgeBg, color: link.badgeColor }}>
                      {link.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Recent audit log */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-bold">Recent activity</h2>
            </div>
            <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
              {!recentLogs || recentLogs.length === 0 ? (
                <p className="p-5 text-[13px] text-[#888]">No activity yet.</p>
              ) : (
                <div className="divide-y divide-[#e5e4df]">
                  {recentLogs.map((log, i) => (
                    <div key={i} className="px-4 py-3">
                      <div className="text-[12px] font-semibold text-[#1a1a18]">
                        {formatAction(log.action)}
                      </div>
                      <div className="text-[11px] text-[#888] mt-0.5">
                        {log.actor_email} · {new Date(log.created_at).toLocaleString('en-GB')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    'employer.approved':   'Employer approved',
    'employer.rejected':   'Employer access revoked',
    'user.role_changed':   'User role changed',
  }
  return map[action] ?? action
}
