'use client'

import { useActionState, useTransition } from 'react'
import { applyToJob, type ApplyJobState } from '@/features/jobs/actions/apply-job'
import { toggleSaveJob } from '@/features/jobs/actions/save-job'

export function ApplyForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState<ApplyJobState, FormData>(applyToJob, {})

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="job_id" value={jobId} />
      {state.error && (
        <p className="text-[12.5px] text-red-600">{state.error}</p>
      )}
      <div>
        <label className="block text-[12px] font-bold text-[#444] mb-1.5">
          Cover letter (optional)
        </label>
        <textarea
          name="cover_letter"
          rows={5}
          placeholder="Introduce yourself and explain why you're a great fit…"
          className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
            focus:outline-none focus:border-[#185FA5] transition-colors resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
          bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  )
}

export function SaveButton({ jobId, saved }: { jobId: string; saved: boolean }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleSaveJob(jobId, saved))}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-semibold
        border transition-colors disabled:opacity-50 ${
          saved
            ? 'border-[#185FA5] text-[#185FA5] bg-[#E6F1FB]'
            : 'border-[#ccc] text-[#666] hover:border-[#185FA5] hover:text-[#185FA5]'
        }`}
    >
      {saved ? '🔖 Saved' : '🔖 Save job'}
    </button>
  )
}
