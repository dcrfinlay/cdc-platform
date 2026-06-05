import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import { StaffReviewForm } from '@/features/internship-letters/components/staff-review-form'
import { signOut } from '@/features/auth/actions/sign-out'
import type { LetterStatus } from '@/lib/types/database.types'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}

export default async function StaffLetterDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { updated } = await searchParams

  const { data: letter } = await supabase
    .from('internship_letters')
    .select('*')
    .eq('id', id)
    .single()

  if (!letter) notFound()

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

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/staff/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/staff/letters" className="hover:text-[#185FA5]">Letters</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">{letter.company_name}</span>
        </div>

        {updated && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ Letter status updated successfully.
          </div>
        )}

        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold">{letter.company_name}</h1>
            <p className="text-[13px] text-[#666] mt-1">
              Submitted {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <LetterStatusBadge status={letter.status as LetterStatus} />
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* Student info */}
          <Section title="Student details">
            <Grid>
              <Detail label="Full name"      value={letter.full_name} />
              <Detail label="Student ID"     value={letter.student_id_no} />
              <Detail label="Faculty"        value={letter.faculty} />
              <Detail label="Year of study"  value={letter.year_of_study} />
              <Detail label="Email"          value={letter.email} />
              <Detail label="Phone"          value={letter.phone} />
            </Grid>
          </Section>

          {/* Internship info */}
          <Section title="Internship details">
            <Grid>
              <Detail label="Company"          value={letter.company_name} />
              <Detail label="Start date"       value={fmt(letter.start_date)} />
              <Detail label="End date"         value={fmt(letter.end_date)} />
              <Detail label="Delivery method"  value={letter.delivery_method === 'pickup' ? 'Pickup in person' : 'Send by post'} />
            </Grid>
            {letter.notes && (
              <div className="mt-3 pt-3 border-t border-[#e5e4df]">
                <div className="text-[11px] text-[#888] font-bold mb-1">Student notes</div>
                <p className="text-[13px] text-[#444]">{letter.notes}</p>
              </div>
            )}
          </Section>

          {/* Review history */}
          {letter.reviewed_at && (
            <Section title="Review history">
              <Grid>
                <Detail label="Reviewed at" value={new Date(letter.reviewed_at).toLocaleString('en-GB')} />
                {letter.collected_at && (
                  <Detail label="Collected at" value={new Date(letter.collected_at).toLocaleString('en-GB')} />
                )}
              </Grid>
              {letter.staff_notes && (
                <div className="mt-3 pt-3 border-t border-[#e5e4df]">
                  <div className="text-[11px] text-[#888] font-bold mb-1">Staff notes</div>
                  <p className="text-[13px] text-[#444]">{letter.staff_notes}</p>
                </div>
              )}
            </Section>
          )}

          {/* Action panel */}
          <Section title="Update status">
            <StaffReviewForm
              letterId={letter.id}
              currentStatus={letter.status as LetterStatus}
              existingNotes={letter.staff_notes}
            />
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e5e4df] rounded-xl p-5">
      <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] mb-4 pb-2 border-b border-[#e5e4df]">
        {title}
      </div>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{children}</div>
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] text-[#888] mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-[#1a1a18]">{value}</div>
    </div>
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
