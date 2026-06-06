import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { JobCard } from '@/features/jobs/components/job-card'
import type { JobType, ApplicationStatus } from '@/lib/types/database.types'
import { Search } from 'lucide-react'

const TYPE_FILTERS = [
  { label: 'All',         value: 'all'        },
  { label: 'Jobs',        value: 'job'        },
  { label: 'Internships', value: 'internship' },
]

interface PageProps {
  searchParams: Promise<{ type?: string; q?: string }>
}

export default async function StudentJobsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { type: typeFilter = 'all', q = '' } = await searchParams

  let query = supabase
    .from('jobs')
    .select('id, title, type, location, is_remote, salary_range, deadline, employer_id, employers(company_name)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (typeFilter !== 'all') query = query.eq('type', typeFilter as JobType)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: jobs } = await query

  const jobIds = (jobs ?? []).map(j => j.id)
  const [{ data: myApps }, { data: savedJobs }] = await Promise.all([
    jobIds.length
      ? supabase.from('applications').select('job_id, status').eq('student_id', user.id).in('job_id', jobIds)
      : { data: [] },
    jobIds.length
      ? supabase.from('saved_jobs').select('job_id').eq('student_id', user.id).in('job_id', jobIds)
      : { data: [] },
  ])

  const appMap   = Object.fromEntries((myApps   ?? []).map(a => [a.job_id, a.status as ApplicationStatus]))
  const savedSet = new Set((savedJobs ?? []).map(s => s.job_id))

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Jobs & internships</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            {jobs?.length ?? 0} open position{jobs?.length !== 1 ? 's' : ''} from partner employers
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/student/jobs/saved"
            className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
            Saved
          </Link>
          <Link href="/student/jobs/my-applications"
            className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
            My applications
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <form method="GET" className="flex-1 min-w-[200px] relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input type="text" name="q" defaultValue={q}
            placeholder="Search jobs…"
            className="w-full pl-9 pr-4 py-2.5 text-[13px] border border-[var(--border)] rounded-xl
              bg-white focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all" />
          {typeFilter !== 'all' && <input type="hidden" name="type" value={typeFilter} />}
        </form>
        <div className="flex gap-1.5">
          {TYPE_FILTERS.map(f => (
            <Link key={f.value} href={`/student/jobs?type=${f.value}${q ? `&q=${q}` : ''}`}
              className={`px-4 py-2.5 rounded-xl text-[12.5px] font-semibold transition-all ${
                typeFilter === f.value
                  ? 'bg-[var(--brand)] text-white shadow-sm'
                  : 'bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]'
              }`}>
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {!jobs || jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-[14px] font-semibold text-[var(--text)] mb-1">No positions found</p>
          <p className="text-[13px] text-[var(--muted)]">Try a different filter or check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map(job => (
            <JobCard key={job.id} {...job}
              type={job.type as JobType}
              companyName={(job.employers as any)?.company_name ?? '—'}
              applicationStatus={appMap[job.id] ?? null}
              isSaved={savedSet.has(job.id)}
              href={`/student/jobs/${job.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
