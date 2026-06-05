import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { EventTypeBadge } from '@/features/events/components/event-type-badge'
import { signOut } from '@/features/auth/actions/sign-out'
import { AttendanceToggle } from './_attendance-toggle'
import type { EventType } from '@/lib/types/database.types'

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

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (!event) notFound()

  const { data: registrations } = await supabase
    .from('event_registrations')
    .select(`
      id, qr_token, registered_at, attended_at,
      profiles (full_name, faculty, year_of_study)
    `)
    .eq('event_id', id)
    .order('registered_at', { ascending: true })

  const attendedCount = (registrations ?? []).filter(r => r.attended_at).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/staff/events" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Events</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/staff/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/staff/events" className="hover:text-[#185FA5]">Events</Link>
          <span>/</span>
          <span className="text-[#1a1a18] truncate">{event.title}</span>
        </div>

        {(created || updated) && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ {created ? 'Event created successfully.' : 'Event updated.'}
          </div>
        )}

        {/* Event header */}
        <div className="bg-white border border-[#e5e4df] rounded-xl p-6 mb-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <EventTypeBadge type={event.type as EventType} />
              {event.is_published ? (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Published</span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0efe9] text-[#888]">Draft</span>
              )}
            </div>
          </div>
          <h1 className="text-[20px] font-bold mb-2">{event.title}</h1>
          {event.description && <p className="text-[13px] text-[#666] mb-3">{event.description}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[12.5px]">
            <div>
              <div className="text-[11px] text-[#888]">Date</div>
              <div className="font-semibold">{fmtDate(event.event_date)}</div>
            </div>
            {(event.location || event.is_online) && (
              <div>
                <div className="text-[11px] text-[#888]">Location</div>
                <div className="font-semibold">{event.is_online ? 'Online' : event.location}</div>
              </div>
            )}
            <div>
              <div className="text-[11px] text-[#888]">Capacity</div>
              <div className="font-semibold">
                {event.capacity != null ? `${(registrations ?? []).length} / ${event.capacity}` : `${(registrations ?? []).length} (open)`}
              </div>
            </div>
          </div>
        </div>

        {/* Attendance panel */}
        <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#e5e4df] flex items-center justify-between">
            <div>
              <div className="text-[14px] font-bold">Attendance</div>
              <div className="text-[12px] text-[#888] mt-0.5">
                {attendedCount} of {(registrations ?? []).length} confirmed
              </div>
            </div>
          </div>

          {!registrations || registrations.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[#888]">No registrations yet.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Registered</th>
                  <th className="text-center px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Attended</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, i) => {
                  const profile = reg.profiles as any
                  return (
                    <tr key={reg.id}
                      className={`border-b border-[#e5e4df] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold">{profile?.full_name ?? '—'}</div>
                        {(profile?.faculty || profile?.year_of_study) && (
                          <div className="text-[11px] text-[#888]">
                            {[profile.faculty, profile.year_of_study].filter(Boolean).join(' · ')}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-[12px] text-[#888] hidden md:table-cell">
                        {new Date(reg.registered_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <AttendanceToggle
                          registrationId={reg.id}
                          attended={!!reg.attended_at}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
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
