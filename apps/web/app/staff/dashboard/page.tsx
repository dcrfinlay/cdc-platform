import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, CalendarDays, BookOpen, ChevronRight } from 'lucide-react'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('full_name, role').eq('id', user.id).single()

  const { data: letterCounts } = await supabase
    .from('internship_letters').select('status')

  const counts = (letterCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const pending = (counts['submitted'] ?? 0) + (counts['under_review'] ?? 0)
  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  const STATS = [
    { label: 'Submitted',    value: counts['submitted']    ?? 0, color: 'var(--brand)',  bg: 'var(--brand-light)'  },
    { label: 'Under review', value: counts['under_review'] ?? 0, color: 'var(--amber)',  bg: 'var(--amber-light)'  },
    { label: 'Approved',     value: counts['approved']     ?? 0, color: 'var(--green)',  bg: 'var(--green-light)'  },
    { label: 'Collected',    value: counts['collected']    ?? 0, color: 'var(--subtle)', bg: '#F3F4F6'             },
  ]

  const LINKS = [
    {
      href: '/staff/letters', Icon: FileText,    title: 'Internship letters',
      desc: 'Review and approve student requests', badge: pending > 0 ? `${pending} pending` : null,
      color: 'var(--amber)', bg: 'var(--amber-light)',
    },
    {
      href: '/staff/events', Icon: CalendarDays, title: 'Events',
      desc: 'Create events, track attendance', badge: null,
      color: 'var(--brand)', bg: 'var(--brand-light)',
    },
    {
      href: '/staff/appointments', Icon: BookOpen, title: 'Appointments',
      desc: 'Manage availability and bookings', badge: null,
      color: 'var(--green)', bg: 'var(--green-light)',
    },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[var(--muted)] mb-1 capitalize">{profile?.role ?? 'Staff'}</p>
        <h1 className="text-[28px] font-bold tracking-tight">Welcome, {firstName}</h1>
      </div>

      {/* Letter stats */}
      <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Letter pipeline</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {STATS.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            </div>
            <div className="text-[26px] font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-[var(--muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {LINKS.map(({ href, Icon, title, desc, badge, color, bg }) => (
          <Link key={href} href={href}
            className="flex flex-col p-5 rounded-2xl border border-[var(--border)] bg-white
              hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={17} style={{ color }} />
              </div>
              {badge && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full"
                  style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>
                  {badge}
                </span>
              )}
            </div>
            <div className="text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors mb-1">{title}</div>
            <div className="text-[11px] text-[var(--muted)] flex-1">{desc}</div>
            <ChevronRight size={14} className="text-[var(--border-strong)] mt-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  )
}
