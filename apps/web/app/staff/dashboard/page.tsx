import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/features/auth/actions/sign-out'
import { NavLogo } from '@/components/nav-logo'

export default async function StaffDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single()

  // Letter counts by actionable status
  const { data: letterCounts } = await supabase
    .from('internship_letters')
    .select('status')

  const counts = (letterCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  const pending = (counts['submitted'] ?? 0) + (counts['under_review'] ?? 0)

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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B] text-[11px] font-bold mb-4 capitalize">
          {profile?.role ?? 'Staff'}
        </div>
        <h1 className="text-[24px] font-bold mb-8">Staff dashboard</h1>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Submitted',    value: counts['submitted']    ?? 0, color: '#185FA5' },
            { label: 'Under review', value: counts['under_review'] ?? 0, color: '#854F0B' },
            { label: 'Approved',     value: counts['approved']     ?? 0, color: '#0F6E56' },
            { label: 'Collected',    value: counts['collected']    ?? 0, color: '#888'    },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#e5e4df] rounded-xl p-4">
              <div className="text-[22px] font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[#888] mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/staff/letters"
            className="bg-white border border-[#e5e4df] rounded-xl p-5 hover:border-[#aaa] transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-[14px] font-bold group-hover:text-[#185FA5] transition-colors">
                Internship letters
              </div>
              {pending > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] text-[10px] font-bold">
                  {pending} pending
                </span>
              )}
            </div>
            <div className="text-[12px] text-[#888]">Review and approve student letter requests.</div>
          </Link>
        </div>
      </div>
    </div>
  )
}
