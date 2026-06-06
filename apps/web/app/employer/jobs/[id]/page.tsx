import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplicationStatusSelect } from './_actions'
import type { ApplicationStatus } from '@/lib/types/database.types'
import { CheckCircle2, ChevronLeft, Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

const STATUS_STYLE: Record<ApplicationStatus, { bg: string; color: string }> = {
  submitted:   { bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  reviewed:    { bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  shortlisted: { bg: 'var(--green-light)',  color: 'var(--green)'  },
  rejected:    { bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  hired:       { bg: 'var(--green-light)',  color: 'var(--green)'  },
}

export default async function EmployerJobDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id }      = await params
  const { created } = await searchParams

  const { data: job } = await supabase
    .from('jobs').select('*').eq('id', id).eq('employer_id', user.id).single()
  if (!job) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, cover_letter, employer_note, created_at, profiles(full_name, faculty, year_of_study, phone), resumes(file_name, cv_visible)')
    .eq('job_id', id)
    .order('created_at', { ascending: true })

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <Link href="/employer/jobs"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to jobs
      </Link>

      {created && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} /> Job posted successfully.
        </div>
      )}

      {/* Job header */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold mb-1">{job.title}</h1>
            <div className="text-[12px] text-[var(--muted)] capitalize">{job.type} · {job.status}</div>
          </div>
          <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex-shrink-0 ${
            job.status === 'published'
              ? 'bg-[var(--green-light)] text-[var(--green)]'
              : 'bg-[#F3F4F6] text-[var(--muted)]'
          }`}>{job.status}</span>
        </div>
      </div>

      {/* Applications */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-2">
          <Users size={16} className="text-[var(--muted)]" />
          <div className="text-[14px] font-bold">
            Applications <span className="text-[var(--muted)] font-normal text-[13px]">({applications?.length ?? 0})</span>
          </div>
        </div>

        {!applications || applications.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[var(--muted)]">No applications yet.</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {applications.map(app => {
              const profile = app.profiles as any
              const resume  = app.resumes  as any
              const { bg, color } = STATUS_STYLE[app.status as ApplicationStatus]
              return (
                <div key={app.id} className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-[14px] font-bold text-[var(--text)]">{profile?.full_name ?? 'Unknown'}</div>
                      <div className="text-[12px] text-[var(--muted)] mt-0.5">
                        {[profile?.faculty, profile?.year_of_study].filter(Boolean).join(' · ')}
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 capitalize"
                      style={{ background: bg, color }}>
                      {app.status.replace('_', ' ')}
                    </span>
                  </div>

                  {app.cover_letter && (
                    <p className="text-[12.5px] text-[var(--text-2)] bg-[var(--bg)] rounded-xl p-3 mb-3 leading-relaxed">
                      {app.cover_letter}
                    </p>
                  )}

                  {resume?.cv_visible && (
                    <div className="text-[12px] text-[var(--brand)] mb-3 font-medium">📄 CV available</div>
                  )}

                  <ApplicationStatusSelect
                    applicationId={app.id}
                    currentStatus={app.status as ApplicationStatus}
                    currentNote={app.employer_note}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
