import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  CalendarDays, Mail, ClipboardList, Ticket, Briefcase,
  FileText, BookOpen, User, ChevronRight, Megaphone,
} from 'lucide-react'

const QUICK_LINKS = [
  { href: '/student/events',                   title: 'Browse events',             desc: 'Workshops, speaker sessions & fairs', Icon: CalendarDays, color: 'var(--brand)',  bg: 'var(--brand-light)'  },
  { href: '/student/letters/new',              title: 'Request internship letter',  desc: 'Ready within 48 hours',              Icon: Mail,         color: 'var(--green)',  bg: 'var(--green-light)'  },
  { href: '/student/letters',                  title: 'My letter requests',         desc: 'Track status of your requests',       Icon: ClipboardList,color: 'var(--amber)',  bg: 'var(--amber-light)'  },
  { href: '/student/events/my-registrations',  title: 'My event registrations',     desc: 'QR codes & upcoming sessions',        Icon: Ticket,       color: 'var(--purple)', bg: 'var(--purple-light)' },
  { href: '/student/jobs',                     title: 'Jobs & internships',         desc: 'Browse partner employer postings',    Icon: Briefcase,    color: 'var(--coral)',  bg: 'var(--coral-light)'  },
  { href: '/student/resume',                   title: 'My CV',                      desc: 'Upload & control visibility',         Icon: FileText,     color: 'var(--muted)',  bg: '#F3F4F6'             },
  { href: '/student/appointments',             title: 'Book appointment',           desc: '1:1 session with career adviser',     Icon: BookOpen,     color: 'var(--brand)',  bg: 'var(--brand-light)'  },
  { href: '/student/profile',                  title: 'My profile',                 desc: 'Skills, degree & contact info',       Icon: User,         color: 'var(--muted)',  bg: '#F3F4F6'             },
]

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { count: activeLetters },
    { data: announcements },
    { count: unreadNotifications },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, faculty, year_of_study').eq('id', user.id).single(),
    supabase.from('internship_letters').select('*', { count: 'exact', head: true })
      .eq('student_id', user.id).in('status', ['submitted', 'under_review', 'approved']),
    supabase.from('announcements').select('title, body, icon, color')
      .eq('is_published', true).order('sort_order').order('created_at', { ascending: false }).limit(4),
    supabase.from('notifications').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).eq('read', false),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[var(--muted)] mb-1">
          {profile?.faculty && profile?.year_of_study
            ? `${profile.faculty} · ${profile.year_of_study}`
            : 'Career Centre portal'}
        </p>
        <h1 className="text-[28px] font-bold tracking-tight">
          Good {timeOfDay()}, {firstName} 👋
        </h1>
      </div>

      {/* Active letter banner */}
      {(activeLetters ?? 0) > 0 && (
        <Link href="/student/letters"
          className="flex items-center justify-between mb-6 px-5 py-4 rounded-2xl border
            border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-200 flex items-center justify-center">
              <Mail size={15} className="text-amber-800" />
            </div>
            <div>
              <div className="text-[13px] font-bold">
                {activeLetters} letter request{activeLetters !== 1 ? 's' : ''} in progress
              </div>
              <div className="text-[12px] opacity-70">Tap to check status</div>
            </div>
          </div>
          <ChevronRight size={16} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      {/* Unread notifications nudge */}
      {(unreadNotifications ?? 0) > 0 && (
        <Link href="/student/notifications"
          className="flex items-center justify-between mb-6 px-5 py-4 rounded-2xl border
            border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-200 flex items-center justify-center">
              <Megaphone size={15} className="text-blue-800" />
            </div>
            <div>
              <div className="text-[13px] font-bold">
                {unreadNotifications} unread notification{unreadNotifications !== 1 ? 's' : ''}
              </div>
              <div className="text-[12px] opacity-70">Tap to view</div>
            </div>
          </div>
          <ChevronRight size={16} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Quick links */}
        <div className="xl:col-span-2">
          <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Quick access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_LINKS.map(link => {
              const { Icon } = link
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-[var(--border)]
                    bg-white hover:border-[var(--border-strong)] hover:shadow-sm transition-all group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: link.bg }}>
                    <Icon size={17} style={{ color: link.color }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-[var(--text)] group-hover:text-[var(--brand)] transition-colors truncate">
                      {link.title}
                    </div>
                    <div className="text-[11px] text-[var(--muted)] truncate">{link.desc}</div>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-[var(--border-strong)] flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Announcements */}
        <div>
          <h2 className="text-[12px] font-bold text-[var(--subtle)] uppercase tracking-widest mb-4">Announcements</h2>
          {!announcements || announcements.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center">
              <p className="text-[12px] text-[var(--muted)]">No announcements right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i}
                  className="rounded-2xl border border-[var(--border)] bg-white p-4 hover:border-[var(--border-strong)] transition-colors">
                  <div className="text-[13px] font-semibold mb-1">{ann.title}</div>
                  <p className="text-[12px] text-[var(--muted)] leading-relaxed line-clamp-3">{ann.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function timeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
