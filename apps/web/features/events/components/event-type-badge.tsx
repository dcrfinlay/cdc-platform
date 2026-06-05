import type { EventType } from '@/lib/types/database.types'

const CONFIG: Record<EventType, { label: string; bg: string; color: string }> = {
  workshop:    { label: 'Workshop',    bg: '#E6F1FB', color: '#185FA5' },
  speaker:     { label: 'Speaker',     bg: '#E1F5EE', color: '#0F6E56' },
  career_fair: { label: 'Career fair', bg: '#FAEEDA', color: '#854F0B' },
  webinar:     { label: 'Webinar',     bg: '#EEEDFE', color: '#534AB7' },
  other:       { label: 'Event',       bg: '#f0efe9', color: '#666'    },
}

export function EventTypeBadge({ type }: { type: EventType }) {
  const { label, bg, color } = CONFIG[type] ?? CONFIG.other
  return (
    <span
      className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
      style={{ background: bg, color }}
    >
      {label}
    </span>
  )
}
