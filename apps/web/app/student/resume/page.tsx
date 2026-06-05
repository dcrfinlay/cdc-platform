import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { ResumeUploadForm, VisibilityToggle } from './_actions'

export default async function StudentResumePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('file_name, file_size, cv_visible, uploaded_at')
    .eq('student_id', user.id)
    .maybeSingle()

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

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">My CV</span>
        </div>

        <h1 className="text-[22px] font-bold mb-1">My CV</h1>
        <p className="text-[13px] text-[#666] mb-6">Upload your CV and control who can see it.</p>

        {/* Current CV */}
        {resume ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-5 mb-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] mb-3">Current CV</div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-lg flex-shrink-0">
                📄
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{resume.file_name}</div>
                <div className="text-[11px] text-[#888] mt-0.5">
                  {resume.file_size ? `${(resume.file_size / 1024).toFixed(0)} KB · ` : ''}
                  Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#ccc] rounded-xl p-8 text-center mb-5">
            <p className="text-[13px] text-[#888]">No CV uploaded yet.</p>
          </div>
        )}

        {/* Upload form */}
        <div className="bg-white border border-[#e5e4df] rounded-xl p-5 mb-5">
          <div className="text-[13px] font-bold mb-4">
            {resume ? 'Replace CV' : 'Upload CV'}
          </div>
          <ResumeUploadForm />
        </div>

        {/* Visibility toggle */}
        {resume && (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[13px] font-bold mb-1">Employer visibility</div>
                <p className="text-[12px] text-[#666] leading-relaxed">
                  When enabled, approved employers can find and view your CV.
                  You can turn this off at any time.
                </p>
              </div>
              <VisibilityToggle visible={resume.cv_visible} />
            </div>
            {resume.cv_visible && (
              <div className="mt-3 px-3 py-2 rounded-lg bg-[#E1F5EE] text-[#0F6E56] text-[12px]">
                ✓ Your CV is visible to employers
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
