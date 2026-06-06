'use client'

import { useActionState } from 'react'
import { updateLetterStatus, type UpdateStatusState } from '@/features/internship-letters/actions/update-letter-status'
import type { LetterStatus } from '@/lib/types/database.types'
import { AlertCircle } from 'lucide-react'

const NEXT_ACTIONS: Record<LetterStatus, { status: LetterStatus; label: string; bg: string; color: string }[]> = {
  submitted: [
    { status: 'under_review', label: 'Start review', bg: 'var(--amber-light)',  color: 'var(--amber)'  },
    { status: 'rejected',     label: 'Reject',       bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  ],
  under_review: [
    { status: 'approved', label: 'Approve', bg: 'var(--green-light)',  color: 'var(--green)'  },
    { status: 'rejected', label: 'Reject',  bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  ],
  approved: [
    { status: 'collected', label: 'Mark as collected', bg: '#F3F4F6', color: 'var(--text-2)' },
  ],
  rejected:  [],
  collected: [],
}

interface StaffReviewFormProps {
  letterId: string
  currentStatus: LetterStatus
  existingNotes?: string | null
}

export function StaffReviewForm({ letterId, currentStatus, existingNotes }: StaffReviewFormProps) {
  const [state, action, pending] = useActionState<UpdateStatusState, FormData>(updateLetterStatus, {})
  const actions = NEXT_ACTIONS[currentStatus] ?? []

  if (actions.length === 0) {
    return (
      <p className="text-[13px] text-[var(--muted)] italic">
        No further actions available for this letter.
      </p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="letter_id" value={letterId} />

      {state.error && (
        <div className="flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-[12px] font-semibold text-[var(--text-2)] mb-1.5">
          Staff notes <span className="font-normal text-[var(--muted)]">(optional — shown to student on approval / rejection)</span>
        </label>
        <textarea name="staff_notes" rows={3}
          defaultValue={existingNotes ?? ''}
          placeholder="Add any notes for the student…"
          className="w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl
            focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50
            transition-all resize-none placeholder:text-[var(--placeholder)]"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map(({ status, label, bg, color }) => (
          <button key={status} type="submit" name="status" value={status} disabled={pending}
            className="px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all hover:opacity-80 disabled:opacity-50 active:scale-[0.98]"
            style={{ background: bg, color }}>
            {pending ? '…' : label}
          </button>
        ))}
      </div>
    </form>
  )
}
