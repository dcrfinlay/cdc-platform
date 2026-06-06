import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { LetterStatusBadge } from '@/features/internship-letters/components/letter-status-badge'
import { StaffReviewForm } from '@/features/internship-letters/components/staff-review-form'
import type { LetterStatus } from '@/lib/types/database.types'
import { CheckCircle2, ChevronLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ updated?: string }>
}

export default async function StaffLetterDetailPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id }      = await params
  const { updated } = await searchParams

  const { data: letter } = await supabase.from('internship_letters').select('*').eq('id', id).single()
  if (!letter) notFound()

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <Link href="/staff/letters"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to letters
      </Link>

      {updated && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} /> Status updated.
        </div>
      )}

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold">{letter.company_name}</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            Submitted {new Date(letter.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <LetterStatusBadge status={letter.status as LetterStatus} />
      </div>

      <div className="space-y-4">
        <Card title="Student details">
          <Grid>
            <Detail label="Full name"     value={letter.full_name} />
            <Detail label="Student ID"    value={letter.student_id_no} />
            <Detail label="Faculty"       value={letter.faculty} />
            <Detail label="Year of study" value={letter.year_of_study} />
            <Detail label="Email"         value={letter.email} />
            <Detail label="Phone"         value={letter.phone} />
          </Grid>
        </Card>

        <Card title="Internship details">
          <Grid>
            <Detail label="Company"         value={letter.company_name} />
            <Detail label="Start date"      value={fmt(letter.start_date)} />
            <Detail label="End date"        value={fmt(letter.end_date)} />
            <Detail label="Delivery"        value={letter.delivery_method === 'pickup' ? 'Pickup in person' : 'Send by post'} />
          </Grid>
          {letter.notes && (
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider mb-1.5">Student notes</div>
              <p className="text-[13px] text-[var(--text-2)]">{letter.notes}</p>
            </div>
          )}
        </Card>

        {letter.reviewed_at && (
          <Card title="Review history">
            <Grid>
              <Detail label="Reviewed at"  value={new Date(letter.reviewed_at).toLocaleString('en-GB')} />
              {letter.collected_at && <Detail label="Collected at" value={new Date(letter.collected_at).toLocaleString('en-GB')} />}
            </Grid>
            {letter.staff_notes && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="text-[11px] text-[var(--muted)] font-bold uppercase tracking-wider mb-1.5">Staff notes</div>
                <p className="text-[13px] text-[var(--text-2)]">{letter.staff_notes}</p>
              </div>
            )}
          </Card>
        )}

        <Card title="Update status">
          <StaffReviewForm
            letterId={letter.id}
            currentStatus={letter.status as LetterStatus}
            existingNotes={letter.staff_notes}
          />
        </Card>
      </div>
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)]">
      <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] mb-4 pb-3 border-b border-[var(--border)]">
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
      <div className="text-[11px] text-[var(--muted)] mb-0.5">{label}</div>
      <div className="text-[13px] font-semibold text-[var(--text)]">{value}</div>
    </div>
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}
