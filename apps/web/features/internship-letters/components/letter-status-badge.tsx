import type { LetterStatus } from '@/lib/types/database.types'

const CONFIG: Record<LetterStatus, { label: string; bg: string; color: string }> = {
  submitted:    { label: 'Submitted',    bg: '#E6F1FB', color: '#185FA5' },
  under_review: { label: 'Under Review', bg: '#FAEEDA', color: '#854F0B' },
  approved:     { label: 'Approved',     bg: '#E1F5EE', color: '#0F6E56' },
  rejected:     { label: 'Rejected',     bg: '#FAECE7', color: '#993C1D' },
  collected:    { label: 'Collected',    bg: '#f0efe9', color: '#666'    },
}

export function LetterStatusBadge({ status }: { status: LetterStatus }) {
  const { label, bg, color } = CONFIG[status] ?? CONFIG.submitted
  return (
    <span
      className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}
