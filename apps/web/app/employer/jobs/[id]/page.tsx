import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { ApplicationStatusSelect } from './_actions'
import type { ApplicationStatus } from '@/lib/types/database.types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string }>
}

const STATUS_STYLE: Record<ApplicationStatus, { bg: string; color: string }> = {
  submitted:   { bg: '#E6F1FB', color: '#185FA5' },
  reviewed:    { bg: '#FAEEDA', color: '#854F0B' },
  shortlisted: { bg: '#E1F5EE', color: '#0F6E56' },
  rejected:    { bg: '#FAECE7', color: '#993C1D' },
  hired:       { bg: '#E1F5EE', color: '#0F6E56' },
}

export default async function EmployerJobDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { created } = await searchParams

  const { data: job } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .eq('employer_id', user.id)
    .single()

  if (!job) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('id, status, cover_letter, employer_note, created_at, profiles(full_name, faculty, year_of_study, phone), resumes(file_name, cv_visible)')
    .eq('job_id', id)
    .order('created_at', { ascending: true })

  const { data: employer } = await supabase.from('employers').select('company_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/employer/jobs" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">My jobs</Link>
          <span className="text-[12.5px] text-[#666]">{employer?.company_name}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        {created && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ Job posted successfully.
          </div>
        )}

        <div className="bg-white border border-[#e5e4df] rounded-xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-bold mb-1">{job.title}</h1>
              <div className="text-[12px] text-[#888] capitalize">{job.type} · {job.status}</div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${
              job.status === 'published' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#f0efe9] text-[#888]'
            }`}>{job.status}</span>
          </div>
        </div>

        <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e4df]">
            <div className="text-[14px] font-bold">
              Applications <span className="text-[#888] font-normal text-[13px]">({applications?.length ?? 0})</span>
            </div>
          </div>

          {!applications || applications.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#888]">No applications yet.</div>
          ) : (
            <div className="divide-y divide-[#e5e4df]">
              {applications.map(app => {
                const profile = app.profiles as any
                const resume  = app.resumes  as any
                const { bg, color } = STATUS_STYLE[app.status as ApplicationStatus]
                return (
                  <div key={app.id} className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="text-[14px] font-bold">{profile?.full_name ?? 'Unknown'}</div>
                        <div className="text-[12px] text-[#888] mt-0.5">
                          {[profile?.faculty, profile?.year_of_study].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: bg, color }}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    {app.cover_letter && (
                      <p className="text-[12.5px] text-[#444] bg-[#fafaf8] rounded-lg p-3 mb-3 leading-relaxed">
                        {app.cover_letter}
                      </p>
                    )}

                    {resume?.cv_visible && (
                      <div className="text-[12px] text-[#185FA5] mb-3">📄 CV available (visible)</div>
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
    </div>
  )
}
