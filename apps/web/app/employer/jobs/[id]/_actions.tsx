'use client'

import { useTransition, useState } from 'react'
import { updateApplicationStatus } from '@/features/jobs/actions/update-application'
import type { ApplicationStatus } from '@/lib/types/database.types'

const STATUSES: { value: ApplicationStatus; label: string }[] = [
  { value: 'submitted',   label: 'Submitted'    },
  { value: 'reviewed',    label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted'  },
  { value: 'rejected',    label: 'Not selected' },
  { value: 'hired',       label: 'Offer made'   },
]

export function ApplicationStatusSelect({
  applicationId,
  currentStatus,
  currentNote,
}: {
  applicationId: string
  currentStatus: ApplicationStatus
  currentNote: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<ApplicationStatus>(currentStatus)
  const [note, setNote]     = useState(currentNote ?? '')

  function save() {
    startTransition(() => updateApplicationStatus(applicationId, status, note || undefined))
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#e5e4df]">
      <select
        value={status}
        onChange={e => setStatus(e.target.value as ApplicationStatus)}
        className="px-3 py-1.5 text-[12px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5] bg-white"
      >
        {STATUSES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note for applicant (optional)"
        className="flex-1 min-w-[180px] px-3 py-1.5 text-[12px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]"
      />
      <button
        onClick={save}
        disabled={isPending || (status === currentStatus && note === (currentNote ?? ''))}
        className="px-4 py-1.5 rounded-lg text-[12px] font-bold bg-[#185FA5] text-white
          hover:opacity-90 disabled:opacity-40 transition-opacity"
      >
        {isPending ? '…' : 'Save'}
      </button>
    </div>
  )
}
