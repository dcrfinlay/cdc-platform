import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { JobType, JobStatus } from '@/lib/types/database.types'
import { Plus, Briefcase } from 'lucide-react'

const STATUS_STYLE: Record<JobStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Draft',     bg: '#F3F4F6',             color: 'var(--muted)'  },
  published: { label: 'Published', bg: 'var(--green-light)',  color: 'var(--green)'  },
  closed:    { label: 'Closed',    bg: 'var(--coral-light)',  color: 'var(--coral)'  },
}

export default async function EmployerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employer } = await supabase.from('employers').select('company_name, approved').eq('id', user.id).single()
  if (!employer?.approved) redirect('/employer/dashboard')

  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, title, type, status, deadline, created_at')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  const jobIds = (jobs ?? []).map(j => j.id)
  const { data: appCounts } = jobIds.length
    ? await supabase.from('applications').select('job_id').in('job_id', jobIds)
    : { data: [] }
  const countMap = (appCounts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.job_id] = (acc[r.job_id] ?? 0) + 1; return acc
  }, {})

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Job postings</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">{jobs?.length ?? 0} postings</p>
        </div>
        <Link href="/employer/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold
            text-white bg-[var(--green)] hover:opacity-90 shadow-sm transition-opacity">
          <Plus size={15} /> Post a job
        </Link>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--green-light)] flex items-center justify-center mx-auto mb-4">
            <Briefcase size={24} className="text-[var(--green)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No job postings yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Post jobs and internships to connect with BMU students.</p>
          <Link href="/employer/jobs/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--green)] hover:opacity-90">
            <Plus size={14} /> Post first job
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden sm:table-cell">Type</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Applications</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => {
                const { label, bg, color } = STATUS_STYLE[job.status as JobStatus]
                const appCount = countMap[job.id] ?? 0
                return (
                  <tr key={job.id}
                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''}`}>
                    <td className="px-5 py-4 font-semibold text-[var(--text)]">{job.title}</td>
                    <td className="px-5 py-4 capitalize text-[var(--muted)] hidden sm:table-cell">{job.type}</td>
                    <td className="px-5 py-4">
                      <span className={`text-[12px] font-semibold ${appCount > 0 ? 'text-[var(--brand)]' : 'text-[var(--muted)]'}`}>
                        {appCount}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>{label}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/employer/jobs/${job.id}`}
                        className="text-[12.5px] text-[var(--brand)] font-semibold hover:underline">
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
