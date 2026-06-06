import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import type { LetterStatus } from '@/lib/types/database.types'

const FILTERS: { label: string; value: LetterStatus | 'all' }[] = [
  { label: 'All',          value: 'all'          },
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

  if (filterStatus !== 'all') query = query.eq('status', filterStatus as LetterStatus)

  const { data: letters } = await query

  const { data: allCounts } = await supabase.from('internship_letters').select('status')
  const countMap = (allCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Internship letters</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">
          {letters?.length ?? 0} {filterStatus === 'all' ? 'total' : filterStatus.replace('_', ' ')} request{(letters?.length ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {FILTERS.map(f => {
          const count = f.value === 'all' ? (allCounts?.length ?? 0) : (countMap[f.value] ?? 0)
          const active = filterStatus === f.value
          return (
            <Link key={f.value} href={`/staff/letters?status=${f.value}`}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
                active
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]'
              }`}>
              {f.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20 text-white' : 'bg-[var(--bg)] text-[var(--muted)]'
                }`}>{count}</span>
              )}
            </Link>
          )
        })}
      </div>

      {!letters || letters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-[13px] text-[var(--muted)]">No letters found for this filter.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                {['Student', 'Company', 'Dates', 'Status', 'Submitted', ''].map((h, i) => (
                  <th key={i} className={`text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider
                    ${i === 2 ? 'hidden md:table-cell' : i === 4 ? 'hidden sm:table-cell' : i === 5 ? '' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {letters.map((letter, i) => (
                <tr key={letter.id}
                  className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${
                    i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''
                  }`}>
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[var(--text)]">{letter.full_name}</div>
                    <div className="text-[11px] text-[var(--muted)]">{letter.student_id_no}</div>
                  </td>
                  <td className="px-5 py-4 text-[var(--text-2)]">{letter.company_name}</td>
                  <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden md:table-cell">
                    {fmt(letter.start_date)} → {fmt(letter.end_date)}
                  </td>
                  <td className="px-5 py-4">
                    <LetterStatusBadge status={letter.status as LetterStatus} />
                  </td>
                  <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden sm:table-cell">
                    {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link href={`/staff/letters/${letter.id}`}
                      className="text-[12.5px] text-[var(--brand)] font-semibold hover:underline">
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
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
