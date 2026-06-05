'use client'

import { useTransition } from 'react'

export function DeleteButton({
  announcementId,
  action,
}: {
  announcementId: string
  action: (id: string) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => {
        if (!confirm('Delete this announcement?')) return
        startTransition(() => action(announcementId))
      }}
      disabled={isPending}
      className="px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-[#e5e4df]
        text-[#888] hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
    >
      {isPending ? '…' : 'Delete'}
    </button>
  )
}
