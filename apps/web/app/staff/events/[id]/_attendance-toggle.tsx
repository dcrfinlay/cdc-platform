'use client'

import { useTransition } from 'react'
import { markAttended } from '@/features/events/actions/mark-attended'

export function AttendanceToggle({
  registrationId,
  attended,
}: {
  registrationId: string
  attended: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function toggle() {
    startTransition(async () => {
      await markAttended(registrationId, !attended)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={attended ? 'Mark as not attended' : 'Mark as attended'}
      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center mx-auto
        transition-colors disabled:opacity-50 ${
          attended
            ? 'bg-[#0F6E56] border-[#0F6E56] text-white'
            : 'border-[#ccc] text-transparent hover:border-[#0F6E56]'
        }`}
    >
      ✓
    </button>
  )
}
