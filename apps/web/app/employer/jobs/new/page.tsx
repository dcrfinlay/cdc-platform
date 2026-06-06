'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { postJob, type PostJobState } from '@/features/jobs/actions/post-job'
import { ChevronLeft } from 'lucide-react'

export default function NewJobPage() {
  const [state, action, pending] = useActionState<PostJobState, FormData>(postJob, {})

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Link href="/employer/jobs"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to jobs
      </Link>

      <h1 className="text-[24px] font-bold tracking-tight mb-6">Post a job or internship</h1>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        {state.error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700">
            {state.error}
          </div>
        )}
        <form action={action} className="space-y-4">
          <F label="Position title *">
            <input type="text" name="title" required placeholder="e.g. Marketing Intern" className={ic} />
          </F>
          <F label="Type *">
            <select name="type" required className={ic}>
              <option value="job">Job</option>
              <option value="internship">Internship</option>
            </select>
          </F>
          <F label="Description">
            <textarea name="description" rows={5} placeholder="Role responsibilities, requirements, what you're looking for…"
              className={ic + ' resize-none'} />
          </F>
          <div className="grid grid-cols-2 gap-4">
            <F label="Location">
              <input type="text" name="location" placeholder="e.g. Tashkent" className={ic} />
            </F>
            <F label="Salary / stipend (optional)">
              <input type="text" name="salary_range" placeholder="e.g. 3,000,000 UZS/mo" className={ic} />
            </F>
          </div>
          <F label="Application deadline">
            <input type="date" name="deadline" className={ic} />
          </F>
          <label className="flex items-center gap-2 text-[13px] cursor-pointer">
            <input type="checkbox" name="is_remote" value="true" className="w-4 h-4 accent-[var(--brand)]" />
            Remote / hybrid role
          </label>
          <div className="pt-4 border-t border-[var(--border)] flex gap-3">
            <button type="submit" name="publish" value="true" disabled={pending}
              className="flex-1 py-3 rounded-xl text-[13.5px] font-bold text-white bg-[var(--green)] hover:opacity-90 disabled:opacity-60">
              {pending ? 'Posting…' : 'Publish now'}
            </button>
            <button type="submit" name="publish" value="false" disabled={pending}
              className="px-5 py-3 rounded-xl text-[13px] font-semibold border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)] disabled:opacity-60">
              Save draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl bg-white focus:outline-none focus:border-[var(--green)] focus:ring-4 focus:ring-green-50 transition-all'
