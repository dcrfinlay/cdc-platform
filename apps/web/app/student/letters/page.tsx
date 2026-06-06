import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import type { LetterStatus } from '@/lib/types/database.types'
import { Plus, CheckCircle2 } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ submitted?: string }>
}

const STEPS: { status: LetterStatus; label: string }[] = [
  { status: 'submitted',    label: 'Submitted' },
  { status: 'under_review', label: 'In review' },
  { status: 'approved',     label: 'Approved'  },
  { status: 'collected',    label: 'Collected' },
]
const STEP_ORDER: LetterStatus[] = ['submitted', 'under_review', 'approved', 'collected']

export default async function StudentLettersPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { submitted } = await searchParams

  const { data: letters } = await supabase
    .from('internship_letters')
    .select('id, company_name, start_date, end_date, status, delivery_method, created_at, staff_notes')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Internship letters</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">Track status of your letter requests.</p>
        </div>
        <Link href="/student/letters/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold
            text-white bg-[var(--brand)] hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={15} /> New request
        </Link>
      </div>

      {submitted && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} />
          Request submitted. You'll be notified when it's ready.
        </div>
      )}

      {!letters || letters.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold text-[var(--text)] mb-1">No letter requests yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Request an official internship letter — processed within 48 hours.</p>
          <Link href="/student/letters/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold
              text-white bg-[var(--brand)] hover:opacity-90 transition-opacity">
            <Plus size={14} /> Request first letter
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {letters.map(letter => {
            const stepIdx = STEP_ORDER.indexOf(letter.status as LetterStatus)
            return (
              <div key={letter.id}
                className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <div className="text-[15px] font-bold truncate">{letter.company_name}</div>
                    <div className="text-[12px] text-[var(--muted)] mt-1">
                      {fmt(letter.start_date)} → {fmt(letter.end_date)}
                      <span className="mx-2">·</span>
                      {letter.delivery_method === 'pickup' ? 'Pickup' : 'Post'}
                    </div>
                    {letter.staff_notes && ['approved', 'rejected'].includes(letter.status) && (
                      <div className="mt-2 text-[12px] text-[var(--brand)] bg-[var(--brand-light)] px-3 py-2 rounded-lg">
                        Staff note: {letter.staff_notes}
                      </div>
                    )}
                  </div>
                  <LetterStatusBadge status={letter.status as LetterStatus} />
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-0">
                  {STEPS.map((step, i) => {
                    const reached  = stepIdx >= i
                    const isCurrent = letter.status === step.status
                    return (
                      <div key={step.status} className="flex items-center flex-1 min-w-0">
                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 transition-colors ${
                          reached ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'
                        }`} />
                        <span className={`text-[10px] mx-1 truncate hidden sm:block transition-colors ${
                          isCurrent ? 'text-[var(--brand)] font-bold' : reached ? 'text-[var(--muted)]' : 'text-[var(--placeholder)]'
                        }`}>{step.label}</span>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-px transition-colors ${reached ? 'bg-[var(--brand)]' : 'bg-[var(--border)]'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-3 text-[11px] text-[var(--subtle)]">
                  Submitted {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
