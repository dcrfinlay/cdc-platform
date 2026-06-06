import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EventCard } from '@/features/events/components/event-card'
import type { EventType } from '@/lib/types/database.types'

const TYPE_FILTERS: { label: string; value: EventType | 'all' }[] = [
  { label: 'All',          value: 'all'         },
  { label: 'Workshops',    value: 'workshop'    },
  { label: 'Speakers',     value: 'speaker'     },
  { label: 'Career fairs', value: 'career_fair' },
  { label: 'Webinars',     value: 'webinar'     },
]

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function StudentEventsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { type: typeFilter = 'all' } = await searchParams

  let query = supabase
    .from('events')
    .select('id, title, description, type, event_date, location, is_online, capacity')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  if (typeFilter !== 'all') query = query.eq('type', typeFilter as EventType)

  const { data: events } = await query

  const { data: myRegs } = await supabase
    .from('event_registrations').select('event_id').eq('student_id', user.id)
  const registeredIds = new Set((myRegs ?? []).map(r => r.event_id))

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Upcoming events</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            {events?.length ?? 0} event{events?.length !== 1 ? 's' : ''} coming up
          </p>
        </div>
        <Link href="/student/events/my-registrations"
          className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)]
            bg-white text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
          My registrations
        </Link>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {TYPE_FILTERS.map(f => (
          <Link key={f.value} href={`/student/events?type=${f.value}`}
            className={`px-4 py-2 rounded-xl text-[12.5px] font-semibold transition-all ${
              typeFilter === f.value
                ? 'bg-[var(--brand)] text-white shadow-sm'
                : 'bg-white border border-[var(--border)] text-[var(--muted)] hover:border-[var(--border-strong)]'
            }`}>
            {f.label}
          </Link>
        ))}
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-[14px] font-semibold text-[var(--text)] mb-1">No upcoming events</p>
          <p className="text-[13px] text-[var(--muted)]">Check back soon — new events are added regularly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(event => (
            <EventCard key={event.id} {...event}
              type={event.type as EventType}
              registrationCount={countMap[event.id] ?? 0}
              isRegistered={registeredIds.has(event.id)}
              href={`/student/events/${event.id}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
