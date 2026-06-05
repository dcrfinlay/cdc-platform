import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { MobileMenu } from '@/components/mobile-menu'

const EMPLOYER_NAV = [
  { href: '/employer/dashboard',     label: 'Dashboard'        },
  { href: '/employer/jobs',          label: 'My job postings'  },
  { href: '/employer/notifications', label: 'Notifications'    },
  { href: '/employer/profile',       label: 'Company profile'  },
]

export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('company_name, approved')
    .eq('id', user.id)
    .single()

  if (!employer?.approved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'var(--surface)' }}>
        <div className="bg-white border border-[#e5e4df] rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0F6E56] text-xl">⏳</span>
          </div>
          <h2 className="text-[17px] font-bold mb-2">Account pending approval</h2>
          <p className="text-[13px] text-[#666] leading-relaxed mb-6">
            Your employer account for <strong>{employer?.company_name}</strong> is under review.
            Our team will verify your details and approve access within 2 working days.
          </p>
          <form action={signOut}>
            <button type="submit" className="text-[12.5px] text-[#185FA5] hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-3">
          <NotificationBell userId={user.id} />
          <Link href="/employer/profile" className="text-[12.5px] text-[#666] hover:text-[#185FA5] hidden sm:block">
            {employer.company_name}
          </Link>
          <form action={signOut} className="hidden sm:block">
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
          <MobileMenu items={EMPLOYER_NAV} userName={employer.company_name} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-bold mb-4">
          Employer
        </div>
        <h1 className="text-[24px] font-bold mb-8">{employer.company_name}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/employer/jobs"
            className="bg-white border border-[#e5e4df] rounded-xl p-5 hover:border-[#aaa] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center mb-3 text-lg">💼</div>
            <div className="text-[14px] font-bold mb-1 group-hover:text-[#0F6E56] transition-colors">My job postings</div>
            <div className="text-[12px] text-[#888]">Post jobs and internships, manage applications.</div>
          </Link>
          <Link href="/employer/notifications"
            className="bg-white border border-[#e5e4df] rounded-xl p-5 hover:border-[#aaa] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-[#E6F1FB] flex items-center justify-center mb-3 text-lg">🔔</div>
            <div className="text-[14px] font-bold mb-1 group-hover:text-[#185FA5] transition-colors">Notifications</div>
            <div className="text-[12px] text-[#888]">View updates from the Career Centre.</div>
          </Link>
          <Link href="/employer/profile"
            className="bg-white border border-[#e5e4df] rounded-xl p-5 hover:border-[#aaa] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-[#f0efe9] flex items-center justify-center mb-3 text-lg">🏢</div>
            <div className="text-[14px] font-bold mb-1 group-hover:text-[#185FA5] transition-colors">Company profile</div>
            <div className="text-[12px] text-[#888]">Update your company details and contact info.</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
