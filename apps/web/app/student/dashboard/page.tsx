import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'
import { NotificationBell } from '@/features/notifications/components/notification-bell'

const ICON_MAP: Record<string, string> = {
  info: 'ℹ', briefcase: '💼', clock: '⏰', star: '⭐', bell: '🔔', users: '👥',
}
const COLOR_MAP: Record<string, { bg: string; color: string }> = {
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  green:  { bg: '#E1F5EE', color: '#0F6E56' },
  amber:  { bg: '#FAEEDA', color: '#854F0B' },
  purple: { bg: '#EEEDFE', color: '#534AB7' },
}

const QUICK_LINKS = [
  { href: '/student/events',              title: 'Browse events',            desc: 'Workshops, speaker sessions, career fairs and webinars.', color: '#185FA5', bg: '#E6F1FB', icon: '📅' },
  { href: '/student/letters/new',         title: 'Request internship letter', desc: 'Submit a new letter request — ready within 48 hours.',    color: '#0F6E56', bg: '#E1F5EE', icon: '✉'  },
  { href: '/student/letters',             title: 'My letter requests',        desc: 'Track the status of your existing letter requests.',       color: '#854F0B', bg: '#FAEEDA', icon: '📋' },
  { href: '/student/events/my-registrations', title: 'My event registrations', desc: 'View your registered events and QR attendance codes.',   color: '#534AB7', bg: '#EEEDFE', icon: '🎟' },
  { href: '/student/jobs',                title: 'Jobs & internships',        desc: 'Browse open positions from partner employers.',            color: '#993C1D', bg: '#FAECE7', icon: '💼' },
  { href: '/student/resume',              title: 'My CV',                     desc: 'Upload your CV and control employer visibility.',          color: '#888',    bg: '#f0efe9', icon: '📄' },
  { href: '/student/appointments',        title: 'Book appointment',          desc: 'Book a 1:1 session with a career adviser.',                color: '#185FA5', bg: '#E6F1FB', icon: '🗓' },
]

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { count: activeLetters },
    { data: announcements },
  ] = await Promise.all([
    supabase.from('profiles').select('full_name, faculty, year_of_study').eq('id', user.id).single(),
    supabase.from('internship_letters').select('*', { count: 'exact', head: true })
      .eq('student_id', user.id).in('status', ['submitted', 'under_review', 'approved']),
    supabase.from('announcements').select('title, body, icon, color')
      .eq('is_published', true).order('sort_order').order('created_at', { ascending: false }).limit(3),
  ])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-3">
          <NotificationBell userId={user.id} />
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[11px] font-bold mb-4">
          Student
        </div>
        <h1 className="text-[24px] font-bold mb-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-[13px] text-[#666] mb-8">
          {profile?.faculty && profile?.year_of_study
            ? `${profile.faculty} · ${profile.year_of_study}`
            : 'Career Centre portal'}
        </p>

        {/* Active letter banner */}
        {(activeLetters ?? 0) > 0 && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#FAEEDA] border border-[#f0d9b0] text-[#854F0B] text-[13px]">
            You have <strong>{activeLetters}</strong> active letter request{activeLetters !== 1 ? 's' : ''} in progress.{' '}
            <Link href="/student/letters" className="font-bold underline">View →</Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Quick links */}
          <div className="lg:col-span-2">
            <h2 className="text-[14px] font-bold text-[#888] uppercase tracking-wider mb-4">Quick access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {QUICK_LINKS.map(link => (
                <Link key={link.href} href={link.href}
                  className="bg-white border border-[#e5e4df] rounded-xl p-4 hover:border-[#aaa] transition-colors group flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                    style={{ background: link.bg }}>
                    {link.icon}
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-[#1a1a18] group-hover:text-[#185FA5] transition-colors">
                      {link.title}
                    </div>
                    <div className="text-[11px] text-[#888] mt-0.5 leading-relaxed">{link.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Announcements */}
          <div>
            <h2 className="text-[14px] font-bold text-[#888] uppercase tracking-wider mb-4">Announcements</h2>
            {!announcements || announcements.length === 0 ? (
              <div className="bg-white border border-[#e5e4df] rounded-xl p-5 text-center">
                <p className="text-[12px] text-[#888]">No announcements right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann, i) => {
                  const { bg } = COLOR_MAP[ann.color] ?? COLOR_MAP.blue
                  return (
                    <div key={i} className="bg-white border border-[#e5e4df] rounded-xl p-4 flex gap-3">
                      <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-base"
                        style={{ background: bg }}>
                        {ICON_MAP[ann.icon] ?? 'ℹ'}
                      </div>
                      <div>
                        <div className="text-[12.5px] font-bold mb-0.5">{ann.title}</div>
                        <p className="text-[11.5px] text-[#666] leading-relaxed line-clamp-3">{ann.body}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
