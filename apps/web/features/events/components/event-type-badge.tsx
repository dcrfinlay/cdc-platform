import type { EventType } from '@/lib/types/database.types'

const CONFIG: Record<EventType, { label: string; bg: string; color: string }> = {
  workshop:    { label: 'Workshop',    bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  speaker:     { label: 'Speaker',     bg: 'var(--green-light)',  color: 'var(--green)'  },
  career_fair: { label: 'Career fair', bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  webinar:     { label: 'Webinar',     bg: 'var(--purple-light)', color: 'var(--purple)' },
  other:       { label: 'Event',       bg: '#F3F4F6',             color: 'var(--muted)'  },
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const { label, bg, color } = CONFIG[type] ?? CONFIG.other
  return (
    <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}>
      {label}
    </span>
  )
}
