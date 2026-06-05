'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { postJob, type PostJobState } from '@/features/jobs/actions/post-job'
import { NavLogo } from '@/components/nav-logo'

export default function NewJobPage() {
  const [state, action, pending] = useActionState<PostJobState, FormData>(postJob, {})

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <Link href="/employer/jobs" className="text-[12.5px] text-[#185FA5] hover:underline">← Back to jobs</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-6">Post a job or internship</h1>

        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
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
              <input type="checkbox" name="is_remote" value="true" className="w-4 h-4 accent-[#185FA5]" />
              Remote / hybrid role
            </label>
            <div className="pt-4 border-t border-[#e5e4df] flex gap-3">
              <button type="submit" name="publish" value="true" disabled={pending}
                className="flex-1 py-3 rounded-lg text-[13.5px] font-bold text-white bg-[#0F6E56] hover:opacity-90 disabled:opacity-60">
                {pending ? 'Posting…' : 'Publish now'}
              </button>
              <button type="submit" name="publish" value="false" disabled={pending}
                className="px-5 py-3 rounded-lg text-[13px] font-semibold border border-[#ccc] text-[#666] hover:border-[#aaa] disabled:opacity-60">
                Save draft
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white focus:outline-none focus:border-[#185FA5] transition-colors'
