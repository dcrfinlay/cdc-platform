import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { EventCard } from '@/features/events/components/event-card'
import { signOut } from '@/features/auth/actions/sign-out'
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

  // Fetch upcoming published events
  let query = supabase
    .from('events')
    .select('id, title, description, type, event_date, location, is_online, capacity')
    .eq('is_published', true)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })

  if (typeFilter !== 'all') query = query.eq('type', typeFilter as EventType)

  const { data: events } = await query

  // Student's registrations (to show "registered" state on cards)
  const { data: myRegs } = await supabase
    .from('event_registrations')
    .select('event_id')
    .eq('student_id', user.id)

  const registeredIds = new Set((myRegs ?? []).map(r => r.event_id))

  // Registration counts per event
  const eventIds = (events ?? []).map(e => e.id)
  const { data: counts } = eventIds.length
    ? await supabase
        .from('event_registrations')
        .select('event_id')
        .in('event_id', eventIds)
    : { data: [] }

  const countMap = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.event_id] = (acc[r.event_id] ?? 0) + 1
    return acc
  }, {})

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/student/events/my-registrations" className="text-[12.5px] text-[#185FA5] hover:underline">
            My registrations
          </Link>
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Events</span>
        </div>

        <h1 className="text-[22px] font-bold mb-1">Upcoming events</h1>
        <p className="text-[13px] text-[#666] mb-6">Register for workshops, speaker sessions, and career fairs.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TYPE_FILTERS.map(f => (
            <Link
              key={f.value}
              href={`/student/events?type=${f.value}`}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                typeFilter === f.value
                  ? 'bg-[#185FA5] text-white'
                  : 'bg-white border border-[#e5e4df] text-[#666] hover:border-[#aaa]'
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {!events || events.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888]">No upcoming events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map(event => (
              <EventCard
                key={event.id}
                {...event}
                type={event.type as EventType}
                registrationCount={countMap[event.id] ?? 0}
                isRegistered={registeredIds.has(event.id)}
                href={`/student/events/${event.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
