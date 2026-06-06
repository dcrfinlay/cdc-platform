import type { LetterStatus } from '@/lib/types/database.types'

const CONFIG: Record<LetterStatus, { label: string; bg: string; color: string }> = {
  submitted:    { label: 'Submitted',    bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  under_review: { label: 'Under review', bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  approved:     { label: 'Approved',     bg: 'var(--green-light)',  color: 'var(--green)'  },
  rejected:     { label: 'Rejected',     bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  collected:    { label: 'Collected',    bg: '#F3F4F6',             color: 'var(--muted)'  },
}

export function LetterStatusBadge({ status }: { status: LetterStatus }) {
  const { label, bg, color } = CONFIG[status] ?? CONFIG.submitted
  return (
    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
      style={{ background: bg, color }}>
      {label}
    </span>
  )
}
