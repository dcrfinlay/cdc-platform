import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ApplyForm, SaveButton } from './_actions'
import type { JobType } from '@/lib/types/database.types'
import { MapPin, Globe, Banknote, CalendarDays, ExternalLink, CheckCircle2, ChevronLeft } from 'lucide-react'

const TYPE_STYLE: Record<JobType, { label: string; bg: string; color: string }> = {
  job:        { label: 'Job',        bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  internship: { label: 'Internship', bg: 'var(--green-light)',  color: 'var(--green)'  },
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ applied?: string }>
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id }      = await params
  const { applied } = await searchParams

  const { data: job } = await supabase
    .from('jobs').select('*, employers(company_name, industry, website)')
    .eq('id', id).eq('status', 'published').single()
  if (!job) notFound()

  const [{ data: myApp }, { data: saved }] = await Promise.all([
    supabase.from('applications').select('id, status, created_at').eq('job_id', id).eq('student_id', user.id).maybeSingle(),
    supabase.from('saved_jobs').select('id').eq('job_id', id).eq('student_id', user.id).maybeSingle(),
  ])

  const employer   = job.employers as any
  const typeStyle  = TYPE_STYLE[job.type as JobType]
  const isExpired  = job.deadline ? new Date(job.deadline) < new Date() : false

  const META = [
    job.is_remote || job.location ? { Icon: job.is_remote ? Globe : MapPin, label: job.is_remote ? 'Remote' : job.location } : null,
    job.salary_range               ? { Icon: Banknote,     label: job.salary_range } : null,
    job.deadline                   ? { Icon: CalendarDays,  label: isExpired ? 'Deadline passed' : `Closes ${fmt(job.deadline)}`, warn: isExpired } : null,
    employer?.website              ? { Icon: ExternalLink,  label: 'Company website', href: employer.website } : null,
  ].filter(Boolean) as { Icon: any; label: string; href?: string; warn?: boolean }[]

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Link href="/student/jobs"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to jobs
      </Link>

      {applied && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} />
          Application submitted! Employer will be in touch if you&apos;re shortlisted.
        </div>
      )}

      {/* Job header */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-4 shadow-[var(--shadow-sm)]">
        <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-3"
          style={{ background: typeStyle.bg, color: typeStyle.color }}>
          {typeStyle.label}
        </span>
        <h1 className="text-[22px] font-bold mb-1">{job.title}</h1>
        <div className="text-[13px] text-[var(--muted)] mb-5">
          {employer?.company_name}
          {employer?.industry && <span className="text-[var(--subtle)]"> · {employer.industry}</span>}
        </div>

        {META.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-5">
            {META.map(({ Icon, label, href, warn }, i) => (
              href ? (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] text-[var(--brand)] hover:underline">
                  <Icon size={13} /> {label}
                </a>
              ) : (
                <div key={i} className={`flex items-center gap-1.5 text-[12px] ${warn ? 'text-[var(--coral)]' : 'text-[var(--muted)]'}`}>
                  <Icon size={13} /> {label}
                </div>
              )
            ))}
          </div>
        )}

        {job.description && (
          <div className="text-[13px] text-[var(--text-2)] leading-relaxed whitespace-pre-wrap pt-4 border-t border-[var(--border)]">
            {job.description}
          </div>
        )}
      </div>

      {/* Action panel */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-[var(--shadow-sm)]">
        {myApp ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--green)]">
              <CheckCircle2 size={16} /> Applied
            </div>
            <p className="text-[12px] text-[var(--muted)]">
              Applied {fmt(myApp.created_at)} · Status: <strong className="text-[var(--text)] capitalize">{myApp.status.replace('_', ' ')}</strong>
            </p>
          </div>
        ) : isExpired ? (
          <p className="text-[13px] text-[var(--muted)]">This position is no longer accepting applications.</p>
        ) : (
          <>
            <h2 className="text-[15px] font-bold mb-4">Apply for this position</h2>
            <ApplyForm jobId={job.id} />
          </>
        )}
        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <SaveButton jobId={job.id} saved={!!saved} />
        </div>
      </div>
    </div>
  )
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
