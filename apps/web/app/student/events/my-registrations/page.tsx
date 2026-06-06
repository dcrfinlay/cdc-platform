import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import type { EventType } from '@/lib/types/database.types'
import { CalendarDays } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ cancelled?: string }>
}

export default async function MyRegistrationsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { cancelled } = await searchParams

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`id, qr_token, registered_at, attended_at, events (id, title, type, event_date, location, is_online)`)
    .eq('student_id', user.id)
    .order('registered_at', { ascending: false })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">My registrations</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            {registrations?.length ?? 0} event{registrations?.length !== 1 ? 's' : ''} registered
          </p>
        </div>
        <Link href="/student/events"
          className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors">
          Browse events
        </Link>
      </div>

      {cancelled && (
        <div className="mb-5 px-5 py-4 rounded-2xl bg-[#F3F4F6] text-[var(--muted)] text-[13px]">
          Registration cancelled.
        </div>
      )}

      {!registrations || registrations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No registrations yet</p>
          <p className="text-[13px] text-[var(--muted)] mb-5">Sign up for workshops, career fairs and speaker sessions.</p>
          <Link href="/student/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white bg-[var(--brand)] hover:opacity-90">
            Browse events
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {registrations.map(reg => {
            const event  = reg.events as any
            const isPast = event ? new Date(event.event_date) < new Date() : false
            const qrUrl  = `${siteUrl}/api/attendance/qr?token=${reg.qr_token}`
            const qrImg  = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`

            return (
              <div key={reg.id} className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
                <div className="p-5 flex gap-5 items-start">
                  {!reg.attended_at && !isPast && (
                    <div className="flex-shrink-0 hidden sm:block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={qrImg} alt="QR" width={80} height={80} className="rounded-xl border border-[var(--border)]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {event && (
                      <>
                        <EventTypeBadge type={event.type as EventType} />
                        <Link href={`/student/events/${event.id}`}
                          className="block text-[14px] font-bold mt-2 mb-1 hover:text-[var(--brand)] transition-colors">
                          {event.title}
                        </Link>
                        <div className="text-[12px] text-[var(--muted)]">
                          {fmtDate(event.event_date)}
                          {(event.location || event.is_online) && (
                            <span className="ml-2">· {event.is_online ? 'Online' : event.location}</span>
                          )}
                        </div>
                      </>
                    )}
                    <div className="mt-2 text-[11px] font-semibold">
                      {reg.attended_at ? (
                        <span className="text-[var(--green)]">✓ Attended</span>
                      ) : isPast ? (
                        <span className="text-[var(--subtle)]">Event has passed</span>
                      ) : (
                        <span className="text-[var(--brand)]">Upcoming — bring your QR code</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
