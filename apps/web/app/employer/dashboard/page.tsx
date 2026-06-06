import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { Briefcase, GraduationCap, Bell, Building2, ChevronRight, Clock } from 'lucide-react'

export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('company_name, approved, industry')
    .eq('id', user.id)
    .single()

  // Pending approval screen
  if (!employer?.approved) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
        <div className="bg-white rounded-3xl border border-[var(--border)] p-10 max-w-md w-full text-center shadow-[var(--shadow-md)]">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-600" />
          </div>
          <h2 className="text-[20px] font-bold mb-2">Account pending approval</h2>
          <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-8">
            Your account for <strong className="text-[var(--text)]">{employer?.company_name}</strong> is under review.
            We'll verify your details and approve access within 2 working days.
          </p>
          <form action={signOut}>
            <button type="submit"
              className="px-5 py-2.5 rounded-xl text-[13px] font-semibold border border-[var(--border)]
                text-[var(--muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)] transition-all">
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Stats
  const [
    { count: activeJobs },
    { count: totalApplications },
    { count: unread },
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('employer_id', user.id).eq('status', 'published'),
    supabase.from('applications').select('*, jobs!inner(employer_id)').eq('jobs.employer_id', user.id),
    supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('read', false),
  ])

  const LINKS = [
    { href: '/employer/jobs',          Icon: Briefcase,     title: 'Job postings',    desc: 'Post jobs, manage applications',      color: 'var(--green)',  bg: 'var(--green-light)',  stat: `${activeJobs ?? 0} active`  },
    { href: '/employer/resumes',       Icon: GraduationCap, title: 'Student CVs',     desc: 'Browse opt-in student CVs',           color: 'var(--purple)', bg: 'var(--purple-light)', stat: 'Search CVs'       },
    { href: '/employer/notifications', Icon: Bell,          title: 'Notifications',   desc: 'Updates from Career Centre',          color: 'var(--brand)',  bg: 'var(--brand-light)',  stat: unread ? `${unread} unread` : 'All read' },
    { href: '/employer/profile',       Icon: Building2,     title: 'Company profile', desc: 'Update company details',              color: 'var(--muted)',  bg: '#F3F4F6',             stat: 'Edit profile'     },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[var(--muted)] mb-1">{employer.industry ?? 'Employer account'}</p>
        <h1 className="text-[28px] font-bold tracking-tight">{employer.company_name}</h1>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Active jobs',       value: activeJobs        ?? 0, color: 'var(--green)'  },
          { label: 'Total applicants',  value: totalApplications ?? 0, color: 'var(--brand)'  },
          { label: 'Unread alerts',     value: unread            ?? 0, color: unread ? 'var(--amber)' : 'var(--subtle)' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
            <div className="text-[28px] font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[12px] text-[var(--muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Quick access</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {LINKS.map(({ href, Icon, title, desc, color, bg, stat }) => (
          <Link key={href} href={href}
            className="flex items-center gap-4 p-5 rounded-2xl border border-[var(--border)]
              bg-white hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]
              transition-all group">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
              <Icon size={18} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors">{title}</div>
              <div className="text-[11px] text-[var(--muted)]">{desc}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-[11px] font-semibold" style={{ color }}>{stat}</div>
              <ChevronRight size={14} className="text-[var(--border-strong)] mt-0.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
