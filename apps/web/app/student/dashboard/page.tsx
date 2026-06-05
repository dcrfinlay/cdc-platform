import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'

const QUICK_LINKS = [
  {
    href:  '/student/letters/new',
    title: 'Request internship letter',
    desc:  'Submit a new letter request — ready within 48 hours.',
    color: '#185FA5',
    bg:    '#E6F1FB',
  },
  {
    href:  '/student/letters',
    title: 'My letter requests',
    desc:  'Track the status of your existing letter requests.',
    color: '#0F6E56',
    bg:    '#E1F5EE',
  },
]

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, faculty, year_of_study')
    .eq('id', user.id)
    .single()

  // Count active letters for badge
  const { count: activeLetters } = await supabase
    .from('internship_letters')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', user.id)
    .in('status', ['submitted', 'under_review', 'approved'])

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[11px] font-bold mb-4">
          Student
        </div>
        <h1 className="text-[24px] font-bold mb-1">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-[13px] text-[#666] mb-8">
          {profile?.faculty && profile.year_of_study
            ? `${profile.faculty} · ${profile.year_of_study}`
            : 'Career Centre portal'}
        </p>

        {/* Stats */}
        {(activeLetters ?? 0) > 0 && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#FAEEDA] border border-[#f0d9b0] text-[#854F0B] text-[13px]">
            You have <strong>{activeLetters}</strong> active letter request{activeLetters !== 1 ? 's' : ''} in progress.{' '}
            <Link href="/student/letters" className="font-bold underline">View →</Link>
          </div>
        )}

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {QUICK_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="bg-white border border-[#e5e4df] rounded-xl p-5 hover:border-[#aaa] transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-lg"
                style={{ background: link.bg, color: link.color }}
              >
                {link.href.includes('new') ? '✉' : '📄'}
              </div>
              <div className="text-[14px] font-bold text-[#1a1a18] mb-1 group-hover:text-[#185FA5] transition-colors">
                {link.title}
              </div>
              <div className="text-[12px] text-[#888]">{link.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
