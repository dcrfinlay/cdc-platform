import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Building2, Users, Megaphone, BarChart3, ClipboardList, FileText, ChevronRight } from 'lucide-react'

const ACTION_LABELS: Record<string, string> = {
  'employer.approved': 'Employer approved',
  'employer.rejected': 'Employer access revoked',
  'user.role_changed': 'User role changed',
}

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
    admin.from('audit_logs').select('action, actor_email, created_at').order('created_at', { ascending: false }).limit(6),
  ])

  const STATS = [
    { label: 'Total users',        value: totalUsers       ?? 0, color: 'var(--brand)',  bg: 'var(--brand-light)'  },
    { label: 'Pending employers',  value: pendingEmployers ?? 0, color: pendingEmployers ? 'var(--amber)' : 'var(--subtle)', bg: pendingEmployers ? 'var(--amber-light)' : '#F3F4F6' },
    { label: 'Active jobs',        value: totalJobs        ?? 0, color: 'var(--green)',  bg: 'var(--green-light)'  },
    { label: 'Letters pending',    value: totalLetters     ?? 0, color: totalLetters ? 'var(--brand)' : 'var(--subtle)', bg: totalLetters ? 'var(--brand-light)' : '#F3F4F6' },
  ]

  const LINKS = [
    { href: '/admin/employers',     Icon: Building2,     label: 'Employer approvals',  badge: pendingEmployers ?? 0  },
    { href: '/admin/users',         Icon: Users,         label: 'User management',      badge: 0                     },
    { href: '/admin/announcements', Icon: Megaphone,     label: 'Announcements',        badge: 0                     },
    { href: '/admin/outcomes',      Icon: BarChart3,     label: 'Graduate outcomes',    badge: 0                     },
    { href: '/admin/audit-log',     Icon: ClipboardList, label: 'Audit log',            badge: 0                     },
    { href: '/staff/letters',       Icon: FileText,      label: 'Internship letters',   badge: totalLetters ?? 0     },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[var(--muted)] mb-1">Administrator</p>
        <h1 className="text-[28px] font-bold tracking-tight">Platform overview</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
            <div className="w-8 h-8 rounded-xl mb-3" style={{ background: s.bg }} />
            <div className="text-[28px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[var(--muted)] mt-2">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick links — 3 cols */}
        <div className="lg:col-span-3">
          <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Quick access</h2>
          <div className="space-y-2">
            {LINKS.map(({ href, Icon, label, badge }) => (
              <Link key={href} href={href}
                className="flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-[var(--border)]
                  bg-white hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-all group">
                <div className="w-8 h-8 rounded-xl bg-[var(--bg)] flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-[var(--muted)]" />
                </div>
                <span className="flex-1 text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">
                  {label}
                </span>
                {badge > 0 && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--amber-light)] text-[var(--amber)]">
                    {badge}
                  </span>
                )}
                <ChevronRight size={14} className="text-[var(--border-strong)] group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent activity — 2 cols */}
        <div className="lg:col-span-2">
          <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Recent activity</h2>
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
            {!recentLogs || recentLogs.length === 0 ? (
              <p className="p-6 text-[13px] text-[var(--muted)]">No activity yet.</p>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recentLogs.map((log, i) => (
                  <div key={i} className="px-5 py-3.5">
                    <div className="text-[12.5px] font-semibold text-[var(--text)]">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mt-0.5 flex items-center gap-1.5">
                      <span className="truncate">{log.actor_email}</span>
                      <span>·</span>
                      <span className="flex-shrink-0">{new Date(log.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="px-5 py-3 border-t border-[var(--border)]">
              <Link href="/admin/audit-log" className="text-[12px] text-[var(--brand)] font-semibold hover:underline">
                View full log →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
