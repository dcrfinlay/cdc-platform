import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { GraduationCap, CalendarDays, Briefcase, FileText, BookOpen, Users, ArrowRight, MapPin, Globe } from 'lucide-react'

const EVENT_TYPE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  workshop:    { bg: '#EBF4FF', color: '#185FA5', label: 'Workshop'    },
  speaker:     { bg: '#EFEDFF', color: '#5B50C8', label: 'Speaker'     },
  career_fair: { bg: '#E3F5EF', color: '#0F6E56', label: 'Career Fair' },
  webinar:     { bg: '#FEF3E2', color: '#92500A', label: 'Webinar'     },
  other:       { bg: '#F3F4F6', color: '#6B7280', label: 'Event'       },
}

const FEATURES = [
  { Icon: Briefcase,    title: 'Jobs & internships',   desc: 'Browse curated openings from verified partner employers.',  color: '#0F6E56', bg: '#E3F5EF' },
  { Icon: CalendarDays, title: 'Events & workshops',   desc: 'Career fairs, speaker sessions, skills workshops and more.', color: '#185FA5', bg: '#EBF4FF' },
  { Icon: FileText,     title: 'Internship letters',   desc: 'Request official university internship letters digitally.',  color: '#92500A', bg: '#FEF3E2' },
  { Icon: BookOpen,     title: 'Career appointments',  desc: 'Book 1:1 sessions with career advisers at your convenience.', color: '#5B50C8', bg: '#EFEDFF' },
  { Icon: GraduationCap,title: 'CV service',           desc: 'Upload your CV and get discovered by partner employers.',   color: '#B03A20', bg: '#FDECE8' },
  { Icon: Users,        title: 'Employer network',     desc: 'Connect with 100+ companies recruiting BMU graduates.',     color: '#0F6E56', bg: '#E3F5EF' },
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { count: upcomingEvents },
    { count: openJobs },
    { data: announcements },
    { data: events },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true })
      .eq('is_published', true).gte('event_date', new Date().toISOString()),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('announcements').select('title, body')
      .eq('is_published', true).order('sort_order').order('created_at', { ascending: false }).limit(3),
    supabase.from('events').select('id, title, type, event_date, location, is_online')
      .eq('is_published', true).gte('event_date', new Date().toISOString())
      .order('event_date').limit(3),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--brand)] flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <div>
              <div className="text-[13px] font-bold leading-tight">Career Centre</div>
              <div className="text-[10px] text-[var(--muted)]">British Management University</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-[var(--text)]
                border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors bg-white">
              Sign in
            </Link>
            <Link href="/signup?role=employer"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold
                text-white bg-[var(--green)] hover:opacity-90 transition-opacity">
              Employer portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1C2E 0%, #1a3a5c 60%, #185FA5 100%)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-20 md:py-28">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-blue-200 text-[12px] font-semibold mb-6 border border-white/10">
            ✦ British Management University
          </div>
          <h1 className="text-[38px] md:text-[52px] font-bold text-white leading-[1.15] mb-5 max-w-3xl tracking-tight">
            Your career<br />starts here.
          </h1>
          <p className="text-[16px] text-blue-200 leading-relaxed max-w-xl mb-10">
            Jobs, events, internship letters, career appointments — everything you need to launch your career, in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-bold
                text-white bg-[var(--brand)] hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/30">
              Get started <ArrowRight size={16} />
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-[14px] font-semibold
                text-white bg-white/10 hover:bg-white/20 border border-white/20 transition-colors backdrop-blur">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats bar ──────────────────────────────────────────── */}
      <section className="bg-white border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-[var(--border)]">
          {[
            { value: upcomingEvents ?? 0, label: 'Upcoming events',       suffix: ''    },
            { value: openJobs       ?? 0, label: 'Open positions',         suffix: '+'   },
            { value: '48',               label: 'Hour letter processing',  suffix: 'h'   },
            { value: '1:1',              label: 'Career appointments',     suffix: ''    },
          ].map(s => (
            <div key={s.label} className="px-8 py-6">
              <div className="text-[28px] font-bold text-[var(--text)]">{s.value}{s.suffix}</div>
              <div className="text-[12px] text-[var(--muted)] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main content ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-10">

        {/* Announcements — 3 cols */}
        <div className="lg:col-span-3">
          <h2 className="text-[18px] font-bold mb-5">Latest news</h2>
          {!announcements || announcements.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[13px] text-[var(--muted)]">No announcements at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => (
                <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow">
                  <div className="text-[14px] font-semibold mb-1.5">{ann.title}</div>
                  <p className="text-[13px] text-[var(--muted)] leading-relaxed">{ann.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming events — 2 cols */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[18px] font-bold">Upcoming events</h2>
            <Link href="/login" className="text-[12.5px] text-[var(--brand)] font-semibold hover:underline">
              View all →
            </Link>
          </div>
          {!events || events.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--border)] p-6 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[13px] text-[var(--muted)]">No upcoming events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => {
                const typeStyle = EVENT_TYPE_COLORS[event.type] ?? EVENT_TYPE_COLORS.other
                return (
                  <div key={event.id}
                    className="bg-white rounded-2xl border border-[var(--border)] p-4 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: typeStyle.bg, color: typeStyle.color }}>
                        {typeStyle.label}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {new Date(event.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <div className="text-[13px] font-semibold leading-snug mb-1.5">{event.title}</div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                      {event.is_online
                        ? <><Globe size={11} /> Online</>
                        : event.location
                          ? <><MapPin size={11} /> {event.location}</>
                          : null}
                    </div>
                  </div>
                )
              })}
              <Link href="/login"
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                  text-[var(--brand)] border border-[var(--brand)] hover:bg-[var(--brand-light)] transition-colors bg-white">
                Sign in to register <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section className="bg-white border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="text-center mb-10">
            <h2 className="text-[24px] font-bold mb-2">Everything in one place</h2>
            <p className="text-[14px] text-[var(--muted)]">All the career tools you need, built for BMU students.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ Icon, title, desc, color, bg }) => (
              <div key={title}
                className="rounded-2xl border border-[var(--border)] p-6 hover:shadow-[var(--shadow)] hover:border-[var(--border-strong)] transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: bg }}>
                  <Icon size={19} style={{ color }} />
                </div>
                <div className="text-[14px] font-semibold mb-1.5">{title}</div>
                <p className="text-[12.5px] text-[var(--muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Employer CTA ───────────────────────────────────────── */}
      <section className="border-t border-[var(--border)]" style={{ background: 'var(--bg)' }}>
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
            style={{ background: 'linear-gradient(135deg, #0F1C2E 0%, #1a3a5c 100%)' }}>
            <div>
              <div className="text-[11px] font-bold text-blue-300 uppercase tracking-widest mb-3">For employers</div>
              <h2 className="text-[24px] font-bold text-white mb-2">Recruit BMU talent</h2>
              <p className="text-[14px] text-blue-200 max-w-md leading-relaxed">
                Post jobs, sponsor career fairs, run workshops, and connect directly with our students and graduates.
              </p>
            </div>
            <Link href="/signup?role=employer"
              className="flex-shrink-0 flex items-center gap-2 px-7 py-4 rounded-xl text-[14px] font-bold
                text-[#0F1C2E] bg-white hover:bg-blue-50 transition-colors whitespace-nowrap shadow-lg">
              Register your company <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[var(--brand)] flex items-center justify-center">
              <GraduationCap size={14} className="text-white" />
            </div>
            <div className="text-[12px] text-[var(--muted)]">Career Development Centre · British Management University</div>
          </div>
          <p className="text-[11px] text-[var(--subtle)]">
            © {new Date().getFullYear()} British Management University
          </p>
        </div>
      </footer>
    </div>
  )
}
