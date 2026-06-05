import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { JobCard } from '@/features/jobs/components/job-card'
import { signOut } from '@/features/auth/actions/sign-out'
import type { JobType, ApplicationStatus } from '@/lib/types/database.types'

const TYPE_FILTERS = [
  { label: 'All',          value: 'all'        },
  { label: 'Jobs',         value: 'job'        },
  { label: 'Internships',  value: 'internship' },
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

  // Student's applications + saved jobs
  const jobIds = (jobs ?? []).map(j => j.id)
  const [{ data: myApps }, { data: savedJobs }] = await Promise.all([
    jobIds.length
      ? supabase.from('applications').select('job_id, status').eq('student_id', user.id).in('job_id', jobIds)
      : { data: [] },
    jobIds.length
      ? supabase.from('saved_jobs').select('job_id').eq('student_id', user.id).in('job_id', jobIds)
      : { data: [] },
  ])

  const appMap   = Object.fromEntries((myApps ?? []).map(a => [a.job_id, a.status as ApplicationStatus]))
  const savedSet = new Set((savedJobs ?? []).map(s => s.job_id))

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/student/jobs/saved"         className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Saved</Link>
          <Link href="/student/jobs/my-applications" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">My applications</Link>
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span><span className="text-[#1a1a18]">Jobs & internships</span>
        </div>

        <h1 className="text-[22px] font-bold mb-1">Jobs & internships</h1>
        <p className="text-[13px] text-[#666] mb-6">Browse open positions from partner employers.</p>

        {/* Search + filters */}
        <form method="GET" className="flex flex-wrap gap-3 mb-6">
          <input
            type="text" name="q" defaultValue={q}
            placeholder="Search jobs…"
            className="flex-1 min-w-[180px] px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] bg-white"
          />
          <div className="flex gap-2">
            {TYPE_FILTERS.map(f => (
              <Link key={f.value} href={`/student/jobs?type=${f.value}${q ? `&q=${q}` : ''}`}
                className={`px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                  typeFilter === f.value
                    ? 'bg-[#185FA5] text-white'
                    : 'bg-white border border-[#e5e4df] text-[#666] hover:border-[#aaa]'
                }`}>
                {f.label}
              </Link>
            ))}
          </div>
        </form>

        {!jobs || jobs.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888]">No open positions found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map(job => (
              <JobCard
                key={job.id}
                {...job}
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
    </div>
  )
}
