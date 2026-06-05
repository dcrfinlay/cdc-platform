import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

const ICON_MAP: Record<string, string> = {
  info:      'ℹ',
  briefcase: '💼',
  clock:     '⏰',
  star:      '⭐',
  bell:      '🔔',
  users:     '👥',
}

const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  green:  { bg: '#E1F5EE', color: '#0F6E56' },
  amber:  { bg: '#FAEEDA', color: '#854F0B' },
  purple: { bg: '#EEEDFE', color: '#534AB7' },
}

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch live data for stats and content
  const [
    { count: upcomingEvents },
    { count: openJobs },
    { data: announcements },
    { data: events },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true })
      .eq('is_published', true).gte('event_date', new Date().toISOString()),
    supabase.from('jobs').select('*', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase.from('announcements').select('title, body, icon, color')
      .eq('is_published', true).order('sort_order').order('created_at', { ascending: false }).limit(3),
    supabase.from('events').select('id, title, type, event_date, location, is_online, capacity')
      .eq('is_published', true).gte('event_date', new Date().toISOString())
      .order('event_date').limit(4),
  ])

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f3' }}>

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="bg-white border-b border-[#e5e4df] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <Image src="/cdc-logo.png" alt="Career Development Centre — BMU"
            width={200} height={60} className="h-9 w-auto" />
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 rounded-lg text-[12.5px] font-semibold text-[#185FA5]
                border border-[#185FA5] hover:bg-[#E6F1FB] transition-colors">
              Student login
            </Link>
            <Link href="/signup?role=employer"
              className="px-4 py-2 rounded-lg text-[12.5px] font-bold text-white
                bg-[#0F6E56] hover:opacity-90 transition-opacity hidden sm:block">
              Employer portal
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#e5e4df]">
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            bg-[#E6F1FB] text-[#185FA5] text-[11px] font-bold mb-5">
            ✦ Your career starts here
          </div>
          <h1 className="text-[32px] md:text-[40px] font-bold leading-tight mb-4 max-w-2xl">
            Opportunities, events &<br className="hidden md:block" /> career support — all in one place
          </h1>
          <p className="text-[14px] text-[#666] leading-relaxed max-w-xl mb-8">
            Stay updated on upcoming events, request official documents, connect with
            industry leaders, and explore jobs and internships. No more Telegram hunting.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/signup"
              className="flex items-center gap-2 px-5 py-3 rounded-lg text-[13px] font-bold
                text-white bg-[#185FA5] hover:opacity-90 transition-opacity">
              Get started →
            </Link>
            <Link href="/login"
              className="flex items-center gap-2 px-5 py-3 rounded-lg text-[13px] font-semibold
                text-[#1a1a18] border border-[#ccc] hover:border-[#aaa] transition-colors bg-white">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="border-b border-[#e5e4df] bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-4 divide-x divide-[#e5e4df]">
          {[
            { value: upcomingEvents ?? 0, label: 'Upcoming events'       },
            { value: openJobs       ?? 0, label: 'Open positions'         },
            { value: '48h',              label: 'Letter processing time'  },
            { value: '1:1',              label: 'Career appointments'     },
          ].map(s => (
            <div key={s.label} className="px-6 py-5 border-b border-[#e5e4df] sm:border-b-0">
              <div className="text-[24px] font-bold text-[#1a1a18]">{s.value}</div>
              <div className="text-[11px] text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Announcements ──────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold">Latest announcements</h2>
          </div>
          {!announcements || announcements.length === 0 ? (
            <div className="bg-white border border-[#e5e4df] rounded-xl p-8 text-center">
              <p className="text-[13px] text-[#888]">No announcements at the moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann, i) => {
                const { bg, color } = COLOR_MAP[ann.color] ?? COLOR_MAP.blue
                return (
                  <div key={i} className="bg-white border border-[#e5e4df] rounded-xl p-4 flex gap-4">
                    <div className="w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                      style={{ background: bg }}>
                      {ICON_MAP[ann.icon] ?? 'ℹ'}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold mb-1">{ann.title}</div>
                      <p className="text-[12px] text-[#666] leading-relaxed">{ann.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Upcoming events ────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] font-bold">Upcoming events</h2>
            <Link href="/login" className="text-[12px] text-[#185FA5] hover:underline">
              View all →
            </Link>
          </div>
          {!events || events.length === 0 ? (
            <div className="bg-white border border-[#e5e4df] rounded-xl p-6 text-center">
              <p className="text-[13px] text-[#888]">No upcoming events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="bg-white border border-[#e5e4df] rounded-xl p-4">
                  <div className="text-[11px] font-bold text-[#185FA5] mb-1">
                    {new Date(event.event_date).toLocaleDateString('en-GB', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                  <div className="text-[13px] font-bold leading-snug mb-1">{event.title}</div>
                  <div className="text-[11px] text-[#888]">
                    {event.is_online ? '🌐 Online' : event.location ? `📍 ${event.location}` : ''}
                  </div>
                </div>
              ))}
              <Link href="/login"
                className="block text-center py-2.5 rounded-lg text-[12.5px] font-semibold
                  text-[#185FA5] border border-[#185FA5] hover:bg-[#E6F1FB] transition-colors bg-white">
                Sign in to register →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Features strip ───────────────────────────────────── */}
      <div className="border-t border-[#e5e4df] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <h2 className="text-[17px] font-bold text-center mb-8">Everything in one place</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: '📅', label: 'Events & workshops'     },
              { icon: '💼', label: 'Jobs & internships'     },
              { icon: '✉',  label: 'Internship letters'     },
              { icon: '🗓', label: 'Career appointments'    },
              { icon: '📄', label: 'CV & resume service'    },
              { icon: '🎤', label: 'Guest speakers'         },
            ].map(f => (
              <div key={f.label}
                className="bg-[#fafaf8] border border-[#e5e4df] rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="text-[11px] font-semibold text-[#444] leading-snug">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Employer CTA ─────────────────────────────────────── */}
      <div className="border-t border-[#e5e4df]">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-[17px] font-bold mb-1">Are you an employer?</h2>
            <p className="text-[13px] text-[#666]">
              Post jobs, attend career fairs, run workshops, and connect with our students.
            </p>
          </div>
          <Link href="/signup"
            className="flex-shrink-0 px-6 py-3 rounded-lg text-[13px] font-bold text-white
              bg-[#0F6E56] hover:opacity-90 transition-opacity whitespace-nowrap">
            Register your company →
          </Link>
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-[#e5e4df] bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Image src="/cdc-logo.png" alt="CDC BMU" width={140} height={44} className="h-7 w-auto opacity-70" />
          <p className="text-[11px] text-[#aaa]">
            © {new Date().getFullYear()} British Management University — Career Development Centre
          </p>
        </div>
      </footer>

    </div>
  )
}
