import Link from 'next/link'
import { EventTypeBadge } from './event-type-badge'
import type { EventType } from '@/lib/types/database.types'
import { MapPin, Globe, Users, CheckCircle2 } from 'lucide-react'

interface EventCardProps {
  id: string
  title: string
  description: string | null
  type: EventType
  event_date: string
  location: string | null
  is_online: boolean
  capacity: number | null
  registrationCount: number
  isRegistered?: boolean
  href: string
}

export function EventCard({
  id, title, description, type, event_date,
  location, is_online, capacity, registrationCount, isRegistered, href,
}: EventCardProps) {
  const seatsLeft = capacity != null ? capacity - registrationCount : null
  const isFull    = seatsLeft != null && seatsLeft <= 0

  return (
    <Link href={href}
      className="flex flex-col bg-white rounded-2xl border border-[var(--border)] overflow-hidden
        hover:border-[var(--border-strong)] hover:shadow-[var(--shadow)] transition-all group">

      {/* Date accent bar */}
      <div className="px-5 pt-4 pb-3 border-b border-[var(--border)]">
        <div className="text-[11px] font-bold text-[var(--brand)] uppercase tracking-wide mb-2">
          {fmtDate(event_date)}
        </div>
        <div className="text-[13.5px] font-bold leading-snug mb-2 group-hover:text-[var(--brand)] transition-colors">
          {title}
        </div>
        {description && (
          <p className="text-[11.5px] text-[var(--muted)] leading-relaxed line-clamp-2">{description}</p>
        )}
        {(location || is_online) && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-[var(--muted)]">
            {is_online ? <Globe size={11} /> : <MapPin size={11} />}
            {is_online ? 'Online' : location}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 flex items-center justify-between">
        <EventTypeBadge type={type} />
        <div className="flex items-center gap-1.5">
          {isRegistered ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--green)]">
              <CheckCircle2 size={12} /> Registered
            </div>
          ) : (
            <div className={`flex items-center gap-1 text-[11px] ${isFull ? 'text-[var(--coral)]' : 'text-[var(--muted)]'}`}>
              <Users size={11} />
              {isFull
                ? 'Full'
                : seatsLeft != null
                  ? `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`
                  : 'Open'}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
