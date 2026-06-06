import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { ApplicationStatus, JobType } from '@/lib/types/database.types'
import { Briefcase } from 'lucide-react'

const STATUS_STYLE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  submitted:   { label: 'Submitted',    bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  reviewed:    { label: 'Under review', bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  shortlisted: { label: 'Shortlisted',  bg: 'var(--green-light)',  color: 'var(--green)'  },
  rejected:    { label: 'Not selected', bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  hired:       { label: 'Offer made 🎉',bg: 'var(--green-light)',  color: 'var(--green)'  },
}

export default async function MyApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, cover_letter, employer_note, created_at, jobs(id, title, type, location, is_remote, employers(company_name))')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">My applications</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">
          {applications?.length ?? 0} application{applications?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {!applications || applications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No applications yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Browse open positions and apply to get started.</p>
          <Link href="/student/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold
              text-white bg-[var(--brand)] hover:opacity-90 transition-opacity">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const job      = app.jobs      as any
            const employer = job?.employers as any
            const { label, bg, color } = STATUS_STYLE[app.status as ApplicationStatus]
            return (
              <div key={app.id}
                className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow)] transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Link href={`/student/jobs/${job?.id}`}
                      className="text-[15px] font-bold hover:text-[var(--brand)] transition-colors">
                      {job?.title ?? '—'}
                    </Link>
                    <div className="text-[12.5px] text-[var(--muted)] mt-0.5">
                      {employer?.company_name}
                      {(job?.location || job?.is_remote) && (
                        <span className="ml-2">{job.is_remote ? '· Remote' : `· ${job.location}`}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0" style={{ background: bg, color }}>
                    {label}
                  </span>
                </div>
                {app.employer_note && ['shortlisted', 'rejected', 'hired'].includes(app.status) && (
                  <div className="mb-3 text-[12.5px] text-[var(--brand)] bg-[var(--brand-light)] px-3 py-2 rounded-xl">
                    Employer note: {app.employer_note}
                  </div>
                )}
                <div className="text-[11px] text-[var(--subtle)] flex items-center gap-2">
                  <span>Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  {(job?.type as JobType) === 'internship' && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--green-light)] text-[var(--green)] font-semibold text-[10px]">Internship</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
