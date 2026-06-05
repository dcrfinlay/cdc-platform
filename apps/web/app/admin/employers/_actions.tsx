'use client'

import { useTransition } from 'react'
import { approveEmployer } from '@/features/admin/actions/approve-employer'

export function EmployerApprovalButton({
  employerId,
  isApproved = false,
}: {
  employerId: string
  isApproved?: boolean
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex gap-2">
      {!isApproved && (
        <button
          onClick={() => startTransition(() => approveEmployer(employerId, true))}
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg text-[12px] font-bold bg-[#E1F5EE] text-[#0F6E56]
            hover:opacity-80 disabled:opacity-50 transition-opacity"
        >
          {isPending ? '…' : 'Approve'}
        </button>
      )}
      {isApproved && (
        <button
          onClick={() => startTransition(() => approveEmployer(employerId, false))}
          disabled={isPending}
          className="px-4 py-1.5 rounded-lg text-[12px] font-semibold border border-[#e5e4df]
            text-[#888] hover:border-red-300 hover:text-red-600 disabled:opacity-50 transition-colors"
        >
          {isPending ? '…' : 'Revoke'}
        </button>
      )}
    </div>
  )
}
