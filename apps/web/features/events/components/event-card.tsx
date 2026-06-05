import Link from 'next/link'
import { EventTypeBadge } from './event-type-badge'
import type { EventType } from '@/lib/types/database.types'

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
    <Link
      href={href}
      className="block bg-white border border-[#e5e4df] rounded-xl overflow-hidden
        hover:border-[#aaa] transition-colors group"
    >
      <div className="p-4 border-b border-[#e5e4df]">
        <div className="text-[11px] font-bold text-[#185FA5] mb-2">
          {fmtDate(event_date)}
        </div>
        <div className="text-[13px] font-bold leading-snug mb-2 group-hover:text-[#185FA5] transition-colors">
          {title}
        </div>
        {description && (
          <p className="text-[11px] text-[#666] leading-relaxed line-clamp-2">{description}</p>
        )}
        {(location || is_online) && (
          <div className="mt-2 text-[11px] text-[#888]">
            {is_online ? '🌐 Online' : `📍 ${location}`}
          </div>
        )}
      </div>
      <div className="px-4 py-2.5 flex items-center justify-between">
        <EventTypeBadge type={type} />
        <div className="flex items-center gap-2">
          {isRegistered && (
            <span className="text-[10px] font-bold text-[#0F6E56]">✓ Registered</span>
          )}
          {!isRegistered && (
            <span className={`text-[11px] ${isFull ? 'text-[#993C1D]' : 'text-[#888]'}`}>
              {isFull
                ? 'Full'
                : seatsLeft != null
                  ? `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`
                  : 'Open'}
            </span>
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
