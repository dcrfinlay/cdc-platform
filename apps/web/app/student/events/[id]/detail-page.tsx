import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import { RegisterButton, CancelButton } from './page'
import type { EventType } from '@/lib/types/database.types'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ registered?: string }>
}

export default async function EventDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { registered } = await searchParams

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!event) notFound()

  // Registration count
  const { count: regCount } = await supabase
    .from('event_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)

  // Is this student registered?
  const { data: myReg } = await supabase
    .from('event_registrations')
    .select('id, qr_token, attended_at')
    .eq('event_id', id)
    .eq('student_id', user.id)
    .maybeSingle()

  const seatsLeft  = event.capacity != null ? event.capacity - (regCount ?? 0) : null
  const isFull     = seatsLeft != null && seatsLeft <= 0
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const qrData     = myReg ? `${siteUrl}/api/attendance/qr?token=${myReg.qr_token}` : null
  const qrImageUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    : null

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

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/events" className="hover:text-[#185FA5]">Events</Link>
          <span>/</span>
          <span className="text-[#1a1a18] truncate">{event.title}</span>
        </div>

        {registered && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ You&apos;re registered! Your QR code is shown below — bring it on the day.
          </div>
        )}

        <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#e5e4df]">
            <div className="flex items-start justify-between gap-4 mb-3">
              <EventTypeBadge type={event.type as EventType} />
              {seatsLeft != null && (
                <span className={`text-[11px] font-semibold ${isFull ? 'text-[#993C1D]' : 'text-[#888]'}`}>
                  {isFull ? 'Fully booked' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} remaining`}
                </span>
              )}
            </div>
            <h1 className="text-[20px] font-bold mb-3">{event.title}</h1>
            {event.description && (
              <p className="text-[13px] text-[#666] leading-relaxed mb-4">{event.description}</p>
            )}
            <div className="grid grid-cols-2 gap-3 text-[12.5px]">
              <div>
                <div className="text-[11px] text-[#888] mb-0.5">Date & time</div>
                <div className="font-semibold">{fmtDate(event.event_date)}</div>
              </div>
              {(event.location || event.is_online) && (
                <div>
                  <div className="text-[11px] text-[#888] mb-0.5">Location</div>
                  <div className="font-semibold">
                    {event.is_online ? 'Online' : event.location}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {myReg ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#0F6E56]">
                  ✓ You are registered for this event
                </div>
                {myReg.attended_at && (
                  <div className="text-[12px] text-[#888]">
                    Attendance confirmed ✓
                  </div>
                )}
                {qrImageUrl && !myReg.attended_at && (
                  <div className="flex flex-col items-center gap-3 py-4 border border-[#e5e4df] rounded-xl">
                    <p className="text-[12px] text-[#666]">Show this QR code at the event</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrImageUrl} alt="Attendance QR code" width={160} height={160} />
                  </div>
                )}
                <CancelButton eventId={event.id} />
              </div>
            ) : (
              <RegisterButton eventId={event.id} isFull={isFull} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
