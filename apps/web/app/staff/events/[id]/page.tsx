import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { AttendanceToggle } from './_attendance-toggle'
import type { EventType } from '@/lib/types/database.types'
import { CheckCircle2, ChevronLeft, Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; updated?: string }>
}

export default async function StaffEventDetailPage({ params, searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params
  const { created, updated } = await searchParams

  const { data: event } = await supabase.from('events').select('*').eq('id', id).single()
  if (!event) notFound()

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`id, qr_token, registered_at, attended_at, profiles (full_name, faculty, year_of_study)`)
    .eq('event_id', id)
    .order('registered_at', { ascending: true })

  const attendedCount = (registrations ?? []).filter(r => r.attended_at).length
  const totalReg      = (registrations ?? []).length

  return (
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <Link href="/staff/events"
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--muted)] hover:text-[var(--brand)] mb-6 transition-colors">
        <ChevronLeft size={14} /> Back to events
      </Link>

      {(created || updated) && (
        <div className="mb-5 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} /> {created ? 'Event created.' : 'Event updated.'}
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <EventTypeBadge type={event.type as EventType} />
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
            event.is_published ? 'bg-[var(--green-light)] text-[var(--green)]' : 'bg-[#F3F4F6] text-[var(--muted)]'
          }`}>
            {event.is_published ? 'Published' : 'Draft'}
          </span>
        </div>
        <h1 className="text-[22px] font-bold mb-2">{event.title}</h1>
        {event.description && <p className="text-[13px] text-[var(--muted)] mb-4">{event.description}</p>}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-[12.5px]">
          <div>
            <div className="text-[11px] text-[var(--muted)] mb-0.5">Date</div>
            <div className="font-semibold">{fmtDate(event.event_date)}</div>
          </div>
          {(event.location || event.is_online) && (
            <div>
              <div className="text-[11px] text-[var(--muted)] mb-0.5">Location</div>
              <div className="font-semibold">{event.is_online ? 'Online' : event.location}</div>
            </div>
          )}
          <div>
            <div className="text-[11px] text-[var(--muted)] mb-0.5">Capacity</div>
            <div className="font-semibold">
              {event.capacity != null ? `${totalReg} / ${event.capacity}` : `${totalReg} (open)`}
            </div>
          </div>
        </div>
      </div>

      {/* Attendance */}
      <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="text-[14px] font-bold">Attendance</div>
            <div className="text-[12px] text-[var(--muted)] mt-0.5 flex items-center gap-1.5">
              <Users size={12} />
              {attendedCount} of {totalReg} confirmed
            </div>
          </div>
        </div>

        {totalReg === 0 ? (
          <div className="p-8 text-center text-[13px] text-[var(--muted)]">No registrations yet.</div>
        ) : (
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Student</th>
                <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden md:table-cell">Registered</th>
                <th className="text-center px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Attended</th>
              </tr>
            </thead>
            <tbody>
              {registrations?.map((reg, i) => {
                const profile = reg.profiles as any
                return (
                  <tr key={reg.id}
                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''}`}>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{profile?.full_name ?? '—'}</div>
                      {(profile?.faculty || profile?.year_of_study) && (
                        <div className="text-[11px] text-[var(--muted)]">
                          {[profile.faculty, profile.year_of_study].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[var(--muted)] hidden md:table-cell">
                      {new Date(reg.registered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <AttendanceToggle registrationId={reg.id} attended={!!reg.attended_at} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
