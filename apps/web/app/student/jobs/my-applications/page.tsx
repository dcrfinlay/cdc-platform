import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import type { ApplicationStatus, JobType } from '@/lib/types/database.types'

const STATUS_STYLE: Record<ApplicationStatus, { label: string; bg: string; color: string }> = {
  submitted:   { label: 'Submitted',    bg: '#E6F1FB', color: '#185FA5' },
  reviewed:    { label: 'Under review', bg: '#FAEEDA', color: '#854F0B' },
  shortlisted: { label: 'Shortlisted',  bg: '#E1F5EE', color: '#0F6E56' },
  rejected:    { label: 'Not selected', bg: '#FAECE7', color: '#993C1D' },
  hired:       { label: 'Offer made',   bg: '#E1F5EE', color: '#0F6E56' },
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

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/jobs" className="hover:text-[#185FA5]">Jobs</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">My applications</span>
        </div>

        <h1 className="text-[22px] font-bold mb-6">My applications</h1>

        {!applications || applications.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">No applications yet.</p>
            <Link href="/student/jobs"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
              Browse jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const job     = app.jobs     as any
              const employer = job?.employers as any
              const { label, bg, color } = STATUS_STYLE[app.status as ApplicationStatus]
              const isInternship = (job?.type as JobType) === 'internship'
              return (
                <div key={app.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <Link href={`/student/jobs/${job?.id}`}
                        className="text-[14px] font-bold hover:text-[#185FA5]">
                        {job?.title ?? '—'}
                      </Link>
                      <div className="text-[12px] text-[#888] mt-0.5">
                        {employer?.company_name}
                        {(job?.location || job?.is_remote) && (
                          <span className="ml-2">{job.is_remote ? '· Remote' : `· ${job.location}`}</span>
                        )}
                      </div>
                    </div>
                    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: bg, color }}>
                      {label}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#aaa] mt-2">
                    Applied {new Date(app.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isInternship && <span className="ml-2 text-[#0F6E56] font-semibold">· Internship</span>}
                  </div>
                  {app.employer_note && ['shortlisted', 'rejected', 'hired'].includes(app.status) && (
                    <div className="mt-3 pt-3 border-t border-[#e5e4df] text-[12px] text-[#666] italic">
                      Note from employer: {app.employer_note}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
