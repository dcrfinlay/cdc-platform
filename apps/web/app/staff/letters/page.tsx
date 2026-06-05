import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import type { LetterStatus } from '@/lib/types/database.types'

const FILTERS: { label: string; value: LetterStatus | 'all' }[] = [
  { label: 'All',          value: 'all'         },
  { label: 'Submitted',    value: 'submitted'    },
  { label: 'Under review', value: 'under_review' },
  { label: 'Approved',     value: 'approved'     },
  { label: 'Rejected',     value: 'rejected'     },
  { label: 'Collected',    value: 'collected'    },
]

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function StaffLettersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: filterStatus = 'all' } = await searchParams

  let query = supabase
    .from('internship_letters')
    .select('id, full_name, student_id_no, company_name, start_date, end_date, status, delivery_method, created_at')
    .order('created_at', { ascending: false })

  if (filterStatus !== 'all') {
    query = query.eq('status', filterStatus as LetterStatus)
  }

  const { data: letters } = await query

  // Status counts for filter chips
  const { data: counts } = await supabase
    .from('internship_letters')
    .select('status')

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/staff/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-1">Internship letter requests</h1>
        <p className="text-[13px] text-[#666] mb-6">
          {letters?.length ?? 0} {filterStatus === 'all' ? 'total' : filterStatus.replace('_', ' ')} request{(letters?.length ?? 0) !== 1 ? 's' : ''}
        </p>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {FILTERS.map(f => {
            const count = f.value === 'all'
              ? (counts?.length ?? 0)
              : (countMap[f.value] ?? 0)
            const active = filterStatus === f.value
            return (
              <Link
                key={f.value}
                href={`/staff/letters?status=${f.value}`}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                  active
                    ? 'bg-[#185FA5] text-white'
                    : 'bg-white border border-[#e5e4df] text-[#666] hover:border-[#aaa]'
                }`}
              >
                {f.label} {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </Link>
            )
          })}
        </div>

        {/* Table */}
        {!letters || letters.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888]">No letters found for this filter.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Dates</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Submitted</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {letters.map((letter, i) => (
                  <tr
                    key={letter.id}
                    className={`border-b border-[#e5e4df] last:border-0 hover:bg-[#fafaf8] transition-colors ${
                      i % 2 === 0 ? '' : 'bg-[#fdfdfb]'
                    }`}
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-[13px]">{letter.full_name}</div>
                      <div className="text-[11px] text-[#888]">{letter.student_id_no}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[13px]">{letter.company_name}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[#666] hidden md:table-cell">
                      {fmt(letter.start_date)} → {fmt(letter.end_date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <LetterStatusBadge status={letter.status as LetterStatus} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#888] hidden sm:table-cell">
                      {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/staff/letters/${letter.id}`}
                        className="text-[12px] text-[#185FA5] font-semibold hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
