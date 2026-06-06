import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { RegisterButton, CancelButton } from './_actions'
import type { EventType } from '@/lib/types/database.types'
import { MapPin, Globe, CalendarDays, Users, CheckCircle2, ChevronLeft } from 'lucide-react'

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
    .from('events').select('*').eq('id', id).eq('is_published', true).single()
  if (!event) notFound()

  const { count: regCount } = await supabase
    .from('event_registrations').select('*', { count: 'exact', head: true }).eq('event_id', id)

  const { data: myReg } = await supabase
    .from('event_registrations').select('id, qr_token, attended_at')
    .eq('event_id', id).eq('student_id', user.id).maybeSingle()

  const seatsLeft  = event.capacity != null ? event.capacity - (regCount ?? 0) : null
  const isFull     = seatsLeft != null && seatsLeft <= 0
  const siteUrl    = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const qrData     = myReg ? `${siteUrl}/api/attendance/qr?token=${myReg.qr_token}` : null
  const qrImageUrl = qrData
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`
    : null

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <Link href="/student/events"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to events
      </Link>

      {registered && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} />
          You&apos;re registered! Show your QR code at the entrance.
        </div>
      )}

      {/* Event card */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)] mb-4">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-start justify-between gap-4 mb-4">
            <EventTypeBadge type={event.type as EventType} />
            {seatsLeft != null && (
              <div className={`flex items-center gap-1.5 text-[12px] font-semibold ${isFull ? 'text-[var(--coral)]' : 'text-[var(--muted)]'}`}>
                <Users size={13} />
                {isFull ? 'Fully booked' : `${seatsLeft} seat${seatsLeft !== 1 ? 's' : ''} left`}
              </div>
            )}
          </div>
          <h1 className="text-[22px] font-bold mb-3">{event.title}</h1>
          {event.description && (
            <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-5">{event.description}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CalendarDays size={13} className="text-[var(--brand)]" />
              </div>
              <div>
                <div className="text-[11px] text-[var(--muted)] mb-0.5">Date & time</div>
                <div className="text-[13px] font-semibold">{fmtDate(event.event_date)}</div>
              </div>
            </div>
            {(event.location || event.is_online) && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[var(--purple-light)] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {event.is_online
                    ? <Globe size={13} className="text-[var(--purple)]" />
                    : <MapPin size={13} className="text-[var(--purple)]" />}
                </div>
                <div>
                  <div className="text-[11px] text-[var(--muted)] mb-0.5">Location</div>
                  <div className="text-[13px] font-semibold">{event.is_online ? 'Online' : event.location}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {myReg ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--green)]">
                <CheckCircle2 size={16} /> Registered
                {myReg.attended_at && <span className="text-[12px] font-normal text-[var(--muted)] ml-1">· Attendance confirmed</span>}
              </div>
              {qrImageUrl && !myReg.attended_at && (
                <div className="flex flex-col items-center gap-3 py-6 border-2 border-dashed border-[var(--border)] rounded-2xl">
                  <p className="text-[12.5px] text-[var(--muted)] font-medium">Show this QR code at the entrance</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrImageUrl} alt="Attendance QR code" width={170} height={170} className="rounded-xl" />
                  <p className="text-[10px] text-[var(--subtle)]">Token: {myReg.qr_token.slice(0, 8)}…</p>
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
  )
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}
