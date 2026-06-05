import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import type { JobType, JobStatus } from '@/lib/types/database.types'

const STATUS_STYLE: Record<JobStatus, { label: string; bg: string; color: string }> = {
  draft:     { label: 'Draft',     bg: '#f0efe9', color: '#888'    },
  published: { label: 'Published', bg: '#E1F5EE', color: '#0F6E56' },
  closed:    { label: 'Closed',    bg: '#FAECE7', color: '#993C1D' },
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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/employer/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <span className="text-[12.5px] text-[#666]">{employer.company_name}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">My job postings</h1>
            <p className="text-[13px] text-[#666] mt-1">{jobs?.length ?? 0} postings</p>
          </div>
          <Link href="/employer/jobs/new"
            className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#0F6E56] hover:opacity-90">
            + Post a job
          </Link>
        </div>

        {!jobs || jobs.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">No job postings yet.</p>
            <Link href="/employer/jobs/new"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#0F6E56] hover:opacity-90">
              Post your first job
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Title</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Type</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Applications</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, i) => {
                  const { label, bg, color } = STATUS_STYLE[job.status as JobStatus]
                  return (
                    <tr key={job.id} className={`border-b border-[#e5e4df] last:border-0 hover:bg-[#fafaf8] ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                      <td className="px-5 py-3.5 font-semibold">{job.title}</td>
                      <td className="px-5 py-3.5 capitalize text-[#666] hidden sm:table-cell">{job.type}</td>
                      <td className="px-5 py-3.5 text-[12px]">{countMap[job.id] ?? 0}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>{label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/employer/jobs/${job.id}`} className="text-[12px] text-[#185FA5] font-semibold hover:underline">
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
    </div>
  )
}
