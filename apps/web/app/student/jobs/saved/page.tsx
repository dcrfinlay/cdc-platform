import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { JobCard } from '@/features/jobs/components/job-card'
import { signOut } from '@/features/auth/actions/sign-out'
import type { JobType } from '@/lib/types/database.types'

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saved } = await supabase
    .from('saved_jobs')
    .select('job_id, jobs(id, title, type, location, is_remote, salary_range, deadline, status, employers(company_name))')
    .eq('student_id', user.id)
    .order('saved_at', { ascending: false })

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

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/jobs" className="hover:text-[#185FA5]">Jobs</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Saved jobs</span>
        </div>

        <h1 className="text-[22px] font-bold mb-6">Saved jobs</h1>

        {!saved || saved.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">No saved jobs yet.</p>
            <Link href="/student/jobs"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {saved.map(s => {
              const job = s.jobs as any
              if (!job) return null
              return (
                <JobCard
                  key={s.job_id}
                  id={job.id}
                  title={job.title}
                  type={job.type as JobType}
                  location={job.location}
                  is_remote={job.is_remote}
                  salary_range={job.salary_range}
                  deadline={job.deadline}
                  companyName={(job.employers as any)?.company_name ?? '—'}
                  isSaved={true}
                  href={`/student/jobs/${job.id}`}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
