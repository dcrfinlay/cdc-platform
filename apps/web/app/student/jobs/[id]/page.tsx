import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { ApplyForm, SaveButton } from './_actions'
import type { JobType } from '@/lib/types/database.types'

const TYPE_LABEL: Record<JobType, string> = { job: 'Job', internship: 'Internship' }
const TYPE_COLOR: Record<JobType, { bg: string; color: string }> = {
  job:        { bg: '#E6F1FB', color: '#185FA5' },
  internship: { bg: '#E1F5EE', color: '#0F6E56' },
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ applied?: string }>
}

export default async function JobDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id }     = await params
  const { applied } = await searchParams

  const { data: job } = await supabase
    .from('jobs')
    .select('*, employers(company_name, industry, website)')
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (!job) notFound()

  const [{ data: myApp }, { data: saved }] = await Promise.all([
    supabase.from('applications').select('id, status, created_at').eq('job_id', id).eq('student_id', user.id).maybeSingle(),
    supabase.from('saved_jobs').select('id').eq('job_id', id).eq('student_id', user.id).maybeSingle(),
  ])

  const employer = job.employers as any
  const { bg, color } = TYPE_COLOR[job.type as JobType]
  const isExpired = job.deadline ? new Date(job.deadline) < new Date() : false
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/jobs" className="hover:text-[#185FA5]">Jobs</Link>
          <span>/</span>
          <span className="text-[#1a1a18] truncate">{job.title}</span>
        </div>

        {applied && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ Application submitted! The employer will be in touch if you&apos;re shortlisted.
          </div>
        )}

        {/* Job header */}
        <div className="bg-white border border-[#e5e4df] rounded-xl p-6 mb-5">
          <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full mb-3"
            style={{ background: bg, color }}>
            {TYPE_LABEL[job.type as JobType]}
          </span>
          <h1 className="text-[20px] font-bold mb-1">{job.title}</h1>
          <div className="text-[13px] text-[#666] mb-4">
            {employer?.company_name}
            {employer?.industry && <span className="text-[#aaa]"> · {employer.industry}</span>}
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[#888] mb-5">
            {(job.location || job.is_remote) && <span>{job.is_remote ? '🌐 Remote' : `📍 ${job.location}`}</span>}
            {job.salary_range  && <span>💰 {job.salary_range}</span>}
            {job.deadline      && <span className={isExpired ? 'text-[#993C1D]' : ''}>📅 {isExpired ? 'Deadline passed' : `Closes ${fmtDate(job.deadline)}`}</span>}
            {employer?.website && <a href={employer.website} target="_blank" rel="noopener noreferrer"
              className="text-[#185FA5] hover:underline" onClick={e => e.stopPropagation()}>🔗 Company website</a>}
          </div>

          {job.description && (
            <div className="text-[13px] text-[#444] leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          )}
        </div>

        {/* Action panel */}
        <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
          {myApp ? (
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-[#0F6E56]">✓ You have applied for this position</p>
              <p className="text-[12px] text-[#888]">
                Applied {fmtDate(myApp.created_at)} · Status: <strong className="text-[#1a1a18] capitalize">{myApp.status.replace('_', ' ')}</strong>
              </p>
            </div>
          ) : isExpired ? (
            <p className="text-[13px] text-[#888]">This position is no longer accepting applications.</p>
          ) : (
            <>
              <h2 className="text-[15px] font-bold mb-4">Apply for this position</h2>
              <ApplyForm jobId={job.id} />
            </>
          )}

          <div className="mt-4 pt-4 border-t border-[#e5e4df]">
            <SaveButton jobId={job.id} saved={!!saved} />
          </div>
        </div>
      </div>
    </div>
  )
}

function fmtDate(date: string) {
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
