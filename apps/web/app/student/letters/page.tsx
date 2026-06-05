import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import type { LetterStatus } from '@/lib/types/database.types'

interface PageProps {
  searchParams: Promise<{ submitted?: string }>
}

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

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

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Back + Header */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Internship letters</span>
        </div>

        {submitted && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ Your request has been submitted. You will be notified when it is ready.
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Internship letters</h1>
            <p className="text-[13px] text-[#666] mt-1">Track your letter requests below.</p>
          </div>
          <Link
            href="/student/letters/new"
            className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90 transition-opacity"
          >
            + New request
          </Link>
        </div>

        {/* Letters list */}
        {!letters || letters.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">You have no letter requests yet.</p>
            <Link
              href="/student/letters/new"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90"
            >
              Request your first letter
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {letters.map(letter => (
              <div key={letter.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold truncate">{letter.company_name}</div>
                    <div className="text-[12px] text-[#888] mt-1">
                      {fmt(letter.start_date)} → {fmt(letter.end_date)}
                      <span className="mx-2">·</span>
                      {letter.delivery_method === 'pickup' ? 'Pickup in person' : 'Send by post'}
                    </div>
                    {letter.staff_notes &&
                      ['approved', 'rejected'].includes(letter.status as string) && (
                      <div className="mt-2 text-[12px] text-[#666] italic">
                        Staff note: {letter.staff_notes}
                      </div>
                    )}
                  </div>
                  <LetterStatusBadge status={letter.status as LetterStatus} />
                </div>

                {/* Progress steps */}
                <div className="mt-4 flex items-center gap-1">
                  {STEPS.map((step, i) => {
                    const reached = STEP_ORDER.indexOf(letter.status as LetterStatus) >= i
                    const isCurrent = letter.status === step.status
                    return (
                      <div key={step.status} className="flex items-center gap-1 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          reached ? 'bg-[#185FA5]' : 'bg-[#e5e4df]'
                        }`} />
                        <span className={`text-[10px] truncate hidden sm:block ${
                          isCurrent ? 'text-[#185FA5] font-bold' : reached ? 'text-[#888]' : 'text-[#ccc]'
                        }`}>
                          {step.label}
                        </span>
                        {i < STEPS.length - 1 && (
                          <div className={`flex-1 h-px mx-1 ${reached ? 'bg-[#185FA5]' : 'bg-[#e5e4df]'}`} />
                        )}
                      </div>
                    )
                  })}
                </div>

                <div className="mt-2 text-[11px] text-[#aaa]">
                  Submitted {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const STEPS: { status: LetterStatus; label: string }[] = [
  { status: 'submitted',    label: 'Submitted'   },
  { status: 'under_review', label: 'In review'   },
  { status: 'approved',     label: 'Approved'    },
  { status: 'collected',    label: 'Collected'   },
]
const STEP_ORDER: LetterStatus[] = ['submitted', 'under_review', 'approved', 'collected']

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
