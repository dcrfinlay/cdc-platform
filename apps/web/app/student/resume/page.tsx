import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ResumeUploadForm, VisibilityToggle } from './_actions'
import { FileText, Upload, Eye, EyeOff } from 'lucide-react'

export default async function StudentResumePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: resume } = await supabase
    .from('resumes')
    .select('file_name, file_size, cv_visible, uploaded_at')
    .eq('student_id', user.id)
    .maybeSingle()

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">My CV</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">Upload your CV and control employer visibility.</p>
      </div>

      {/* Current CV card */}
      {resume ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-4 shadow-[var(--shadow-sm)]">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] mb-3">Current CV</div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[var(--coral-light)] flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-[var(--coral)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold truncate text-[var(--text)]">{resume.file_name}</div>
              <div className="text-[11px] text-[var(--muted)] mt-0.5">
                {resume.file_size ? `${(resume.file_size / 1024).toFixed(0)} KB · ` : ''}
                Uploaded {new Date(resume.uploaded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border-2 border-dashed border-[var(--border)] p-10 text-center mb-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--bg)] flex items-center justify-center mx-auto mb-3">
            <Upload size={20} className="text-[var(--muted)]" />
          </div>
          <p className="text-[13px] font-semibold text-[var(--text)] mb-1">No CV uploaded yet</p>
          <p className="text-[12px] text-[var(--muted)]">PDF only · Max 5MB</p>
        </div>
      )}

      {/* Upload form */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-4 shadow-[var(--shadow-sm)]">
        <div className="text-[13px] font-bold mb-4 flex items-center gap-2">
          <Upload size={15} className="text-[var(--muted)]" />
          {resume ? 'Replace CV' : 'Upload CV'}
        </div>
        <ResumeUploadForm />
      </div>

      {/* Visibility toggle */}
      {resume && (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                resume.cv_visible ? 'bg-[var(--green-light)]' : 'bg-[#F3F4F6]'
              }`}>
                {resume.cv_visible
                  ? <Eye size={16} className="text-[var(--green)]" />
                  : <EyeOff size={16} className="text-[var(--muted)]" />
                }
              </div>
              <div>
                <div className="text-[13px] font-bold mb-1">Employer visibility</div>
                <p className="text-[12px] text-[var(--muted)] leading-relaxed max-w-xs">
                  When enabled, approved employers can find and download your CV. You can turn this off at any time.
                </p>
                {resume.cv_visible && (
                  <div className="mt-2 text-[12px] text-[var(--green)] font-semibold">
                    ✓ Visible to employers
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <VisibilityToggle visible={resume.cv_visible} />
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 px-4 py-3 rounded-xl bg-[var(--amber-light)] border border-amber-200 text-[12px] text-[var(--amber)]">
        💡 Add <Link href="/student/profile" className="font-bold underline">skills and degree</Link> to your profile to appear in employer searches.
      </div>
    </div>
  )
}
