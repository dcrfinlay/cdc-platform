import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import type { EventType } from '@/lib/types/database.types'

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
    .select(`
      id, qr_token, registered_at, attended_at,
      events (id, title, type, event_date, location, is_online)
    `)
    .eq('student_id', user.id)
    .order('registered_at', { ascending: false })

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/events" className="hover:text-[#185FA5]">Events</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">My registrations</span>
        </div>

        {cancelled && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#f0efe9] text-[#666] text-[13px]">
            Registration cancelled.
          </div>
        )}

        <h1 className="text-[22px] font-bold mb-6">My registrations</h1>

        {!registrations || registrations.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888] mb-4">You haven&apos;t registered for any events yet.</p>
            <Link href="/student/events"
              className="inline-block px-5 py-2.5 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
              Browse events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {registrations.map(reg => {
              const event = reg.events as any
              const isPast = event ? new Date(event.event_date) < new Date() : false
              const qrUrl  = `${siteUrl}/api/attendance/qr?token=${reg.qr_token}`
              const qrImg  = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrUrl)}`

              return (
                <div key={reg.id} className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
                  <div className="p-5 flex gap-5 items-start">
                    {/* QR code */}
                    {!reg.attended_at && !isPast && (
                      <div className="flex-shrink-0 hidden sm:block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={qrImg} alt="QR" width={80} height={80} className="rounded-lg border border-[#e5e4df]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      {event && (
                        <>
                          <EventTypeBadge type={event.type as EventType} />
                          <Link href={`/student/events/${event.id}`}
                            className="block text-[14px] font-bold mt-2 mb-1 hover:text-[#185FA5]">
                            {event.title}
                          </Link>
                          <div className="text-[12px] text-[#888]">
                            {fmtDate(event.event_date)}
                            {(event.location || event.is_online) && (
                              <span className="ml-2">· {event.is_online ? 'Online' : event.location}</span>
                            )}
                          </div>
                        </>
                      )}
                      <div className="mt-2 text-[11px]">
                        {reg.attended_at ? (
                          <span className="text-[#0F6E56] font-semibold">✓ Attended</span>
                        ) : isPast ? (
                          <span className="text-[#aaa]">Event has passed</span>
                        ) : (
                          <span className="text-[#185FA5]">Upcoming — bring your QR code</span>
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
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
