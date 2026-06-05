import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import type { EventType } from '@/lib/types/database.types'

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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/staff/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Events</h1>
            <p className="text-[13px] text-[#666] mt-1">{events?.length ?? 0} events total</p>
          </div>
          <Link
            href="/staff/events/new"
            className="px-4 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90"
          >
            + New event
          </Link>
        </div>

        {!events || events.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">No events yet.</p>
            <Link href="/staff/events/new"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
              Create first event
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Event</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Date</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Registrations</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {events.map((event, i) => {
                  const regCount  = countMap[event.id] ?? 0
                  const isPast    = new Date(event.event_date) < new Date()
                  return (
                    <tr key={event.id}
                      className={`border-b border-[#e5e4df] last:border-0 hover:bg-[#fafaf8] ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{event.title}</span>
                          <EventTypeBadge type={event.type as EventType} />
                        </div>
                        {(event.location || event.is_online) && (
                          <div className="text-[11px] text-[#888] mt-0.5">
                            {event.is_online ? 'Online' : event.location}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#666] hidden md:table-cell">
                        {fmtDate(event.event_date)}
                      </td>
                      <td className="px-5 py-3.5 text-[12px]">
                        <span className={event.capacity && regCount >= event.capacity ? 'text-[#993C1D] font-semibold' : ''}>
                          {regCount}{event.capacity ? `/${event.capacity}` : ''}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        {event.is_published ? (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]">
                            {isPast ? 'Past' : 'Published'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0efe9] text-[#888]">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <Link href={`/staff/events/${event.id}`}
                          className="text-[12px] text-[#185FA5] font-semibold hover:underline">
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
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
