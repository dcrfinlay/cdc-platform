'use client'

import { useTransition } from 'react'
import { markAllNotificationsRead } from '@/features/notifications/actions/mark-read'

export function MarkAllReadButton() {
  const [isPending, startTransition] = useTransition()
  return (
    <button
      onClick={() => startTransition(() => markAllNotificationsRead())}
      disabled={isPending}
      className="text-[12px] text-[#0F6E56] font-semibold hover:underline disabled:opacity-50"
    >
      {isPending ? 'Marking…' : 'Mark all as read'}
    </button>
  )
}
