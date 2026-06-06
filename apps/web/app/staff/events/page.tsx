import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import type { EventType } from '@/lib/types/database.types'
import { Plus, CalendarDays } from 'lucide-react'

export default async function StaffEventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: events } = await supabase
    .from('events')
    .select('id, title, type, event_date, capacity, is_published, is_online, location')
    .order('event_date', { ascending: false })

  const eventIds = (events ?? []).map(e => e.id)
  const { data: counts } = eventIds.length
    ? await supabase.from('event_registrations').select('event_id').in('event_id', eventIds)
    : { data: [] }

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.event_id] = (acc[r.event_id] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Events</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">{events?.length ?? 0} events total</p>
        </div>
        <Link href="/staff/events/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--brand)] hover:opacity-90 shadow-sm">
          <Plus size={15} /> New event
        </Link>
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No events yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Create career fairs, workshops and speaker sessions.</p>
          <Link href="/staff/events/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--brand)] hover:opacity-90">
            <Plus size={14} /> Create first event
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Event</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Registrations</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => {
                const regCount = countMap[event.id] ?? 0
                const isPast   = new Date(event.event_date) < new Date()
                return (
                  <tr key={event.id}
                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[var(--text)]">{event.title}</span>
                        <EventTypeBadge type={event.type as EventType} />
                      </div>
                      {(event.location || event.is_online) && (
                        <div className="text-[11px] text-[var(--muted)] mt-0.5">
                          {event.is_online ? 'Online' : event.location}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden md:table-cell">
                      {fmtDate(event.event_date)}
                    </td>
                    <td className="px-5 py-4 text-[12px]">
                      <span className={event.capacity && regCount >= event.capacity ? 'text-[var(--coral)] font-semibold' : 'text-[var(--text-2)]'}>
                        {regCount}{event.capacity ? `/${event.capacity}` : ''}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        event.is_published
                          ? 'bg-[var(--green-light)] text-[var(--green)]'
                          : 'bg-[#F3F4F6] text-[var(--muted)]'
                      }`}>
                        {event.is_published ? (isPast ? 'Past' : 'Published') : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/staff/events/${event.id}`}
                        className="text-[12.5px] text-[var(--brand)] font-semibold hover:underline">
                        Manage →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
