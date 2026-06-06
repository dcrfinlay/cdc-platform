import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { BookSlotForm, CancelBookingButton } from './_actions'
import type { BookingStatus } from '@/lib/types/database.types'

interface PageProps {
  searchParams: Promise<{ booked?: string }>
}

const STATUS_STYLE: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: '#FAEEDA', color: '#854F0B' },
  confirmed: { label: 'Confirmed', bg: '#E1F5EE', color: '#0F6E56' },
  cancelled: { label: 'Cancelled', bg: '#f0efe9', color: '#888'    },
  completed: { label: 'Completed', bg: '#E6F1FB', color: '#185FA5' },
}

export default async function StudentAppointmentsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { booked } = await searchParams

  // Available slots
  const { data: slots } = await supabase
    .from('appointment_slots')
    .select('id, slot_date, start_time, end_time, label, profiles(full_name)')
    .eq('is_available', true)
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date').order('start_time')

  // Student's bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, reason, staff_notes, created_at, appointment_slots(slot_date, start_time, end_time, label, profiles(full_name))')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}><button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button></form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span><span className="text-[#1a1a18]">Appointments</span>
        </div>

        {booked && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[13px]">
            ✓ Appointment booked! Check your upcoming appointments below.
          </div>
        )}

        <h1 className="text-[22px] font-bold mb-8">Book an appointment</h1>

        {/* Available slots */}
        <section className="mb-10">
          <h2 className="text-[15px] font-bold mb-4">Available slots</h2>
          {!slots || slots.length === 0 ? (
            <div className="bg-white border border-[#e5e4df] rounded-xl p-8 text-center">
              <p className="text-[13px] text-[#888]">No available slots at the moment. Check back soon.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map(slot => {
                const staff = slot.profiles as any
                return (
                  <div key={slot.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[14px] font-bold">
                          {fmtDate(slot.slot_date)} · {slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}
                        </div>
                        <div className="text-[12px] text-[#888] mt-0.5">
                          {slot.label && <span className="mr-2">{slot.label}</span>}
                          with {staff?.full_name ?? 'CDC Staff'}
                        </div>
                      </div>
                      <BookSlotForm slotId={slot.id} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* My bookings */}
        <section>
          <h2 className="text-[15px] font-bold mb-4">My appointments</h2>
          {!bookings || bookings.length === 0 ? (
            <p className="text-[13px] text-[#888]">No appointments yet.</p>
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => {
                const slot   = booking.appointment_slots as any
                const staff  = slot?.profiles as any
                const { label, bg, color } = STATUS_STYLE[booking.status as BookingStatus]
                return (
                  <div key={booking.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[14px] font-bold">
                          {slot ? `${fmtDate(slot.slot_date)} · ${slot.start_time?.slice(0,5)}–${slot.end_time?.slice(0,5)}` : '—'}
                        </div>
                        <div className="text-[12px] text-[#888] mt-0.5">
                          {slot?.label && <span className="mr-2">{slot.label}</span>}
                          with {staff?.full_name ?? 'CDC Staff'}
                        </div>
                        {booking.reason && <p className="text-[12px] text-[#666] mt-1 italic">{booking.reason}</p>}
                        {booking.staff_notes && (
                          <p className="text-[12px] text-[#185FA5] mt-1">Note: {booking.staff_notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: bg, color }}>{label}</span>
                        {booking.status === 'confirmed' && (
                          <>
                            <a
                              href={`/api/appointments/ical?bookingId=${booking.id}`}
                              className="text-[11px] text-[#185FA5] hover:underline"
                            >
                              + Add to calendar
                            </a>
                            <CancelBookingButton bookingId={booking.id} />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
