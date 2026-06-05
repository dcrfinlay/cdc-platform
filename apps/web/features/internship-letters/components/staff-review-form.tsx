'use client'

import { useActionState } from 'react'
import { updateLetterStatus, type UpdateStatusState } from '@/features/internship-letters/actions/update-letter-status'
import type { LetterStatus } from '@/lib/types/database.types'

// Actions available per current status
const NEXT_ACTIONS: Record<LetterStatus, { status: LetterStatus; label: string; style: string }[]> = {
  submitted: [
    { status: 'under_review', label: 'Start review',  style: 'bg-[#FAEEDA] text-[#854F0B]' },
    { status: 'rejected',     label: 'Reject',        style: 'bg-[#FAECE7] text-[#993C1D]' },
  ],
  under_review: [
    { status: 'approved',  label: 'Approve',  style: 'bg-[#E1F5EE] text-[#0F6E56]' },
    { status: 'rejected',  label: 'Reject',   style: 'bg-[#FAECE7] text-[#993C1D]' },
  ],
  approved: [
    { status: 'collected', label: 'Mark as collected', style: 'bg-[#f0efe9] text-[#444]' },
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
  const [state, action, pending] = useActionState<UpdateStatusState, FormData>(
    updateLetterStatus,
    {}
  )

  const actions = NEXT_ACTIONS[currentStatus] ?? []

  if (actions.length === 0) {
    return (
      <div className="text-[12.5px] text-[#888] italic">
        No further actions available for this letter.
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="letter_id" value={letterId} />

      {state.error && (
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <div>
        <label className="block text-[12px] font-bold text-[#444] mb-1.5">
          Staff notes (optional — visible to student on approval/rejection)
        </label>
        <textarea
          name="staff_notes"
          rows={3}
          defaultValue={existingNotes ?? ''}
          placeholder="Add any notes for the student…"
          className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
            focus:outline-none focus:border-[#185FA5] transition-colors resize-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map(({ status, label, style }) => (
          <button
            key={status}
            type="submit"
            name="status"
            value={status}
            disabled={pending}
            className={`px-5 py-2.5 rounded-lg text-[13px] font-bold transition-opacity
              hover:opacity-80 disabled:opacity-50 ${style}`}
          >
            {pending ? '…' : label}
          </button>
        ))}
      </div>
    </form>
  )
}
