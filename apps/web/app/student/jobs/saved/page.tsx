import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { JobCard } from '@/features/jobs/components/job-card'
import type { JobType } from '@/lib/types/database.types'
import { Star } from 'lucide-react'

export default async function SavedJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: saved } = await supabase
    .from('saved_jobs')
    .select('job_id, jobs(id, title, type, location, is_remote, salary_range, deadline, status, employers(company_name))')
    .eq('student_id', user.id)
    .order('saved_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Saved jobs</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">{saved?.length ?? 0} saved position{saved?.length !== 1 ? 's' : ''}</p>
      </div>

      {!saved || saved.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Star size={24} className="text-amber-500" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No saved jobs yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Bookmark jobs to review them later.</p>
          <Link href="/student/jobs"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--brand)] hover:opacity-90">
            Browse jobs
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saved.map(s => {
            const job = s.jobs as any
            if (!job) return null
            return (
              <JobCard key={s.job_id}
                id={job.id} title={job.title} type={job.type as JobType}
                location={job.location} is_remote={job.is_remote}
                salary_range={job.salary_range} deadline={job.deadline}
                companyName={(job.employers as any)?.company_name ?? '—'}
                isSaved={true} href={`/student/jobs/${job.id}`}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
