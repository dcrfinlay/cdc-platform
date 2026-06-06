import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookSlotForm, CancelBookingButton } from './_actions'
import type { BookingStatus } from '@/lib/types/database.types'
import { CheckCircle2, CalendarDays, CalendarPlus, BookOpen } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{ booked?: string }>
}

const STATUS_STYLE: Record<BookingStatus, { label: string; bg: string; color: string }> = {
  pending:   { label: 'Pending',   bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  confirmed: { label: 'Confirmed', bg: 'var(--green-light)',  color: 'var(--green)'  },
  cancelled: { label: 'Cancelled', bg: '#F3F4F6',             color: 'var(--muted)'  },
  completed: { label: 'Completed', bg: 'var(--brand-light)',  color: 'var(--brand)'  },
}

export default async function StudentAppointmentsPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { booked } = await searchParams

  const { data: slots } = await supabase
    .from('appointment_slots')
    .select('id, slot_date, start_time, end_time, label, profiles(full_name)')
    .eq('is_available', true)
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date').order('start_time')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status, reason, staff_notes, created_at, appointment_slots(slot_date, start_time, end_time, label, profiles(full_name))')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Book an appointment</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">Book a 1:1 session with a career adviser.</p>
      </div>

      {booked && (
        <div className="mb-6 flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
          <CheckCircle2 size={17} /> Appointment booked! Check your upcoming appointments below.
        </div>
      )}

      {/* Available slots */}
      <section className="mb-8">
        <h2 className="text-[15px] font-bold mb-4">Available slots</h2>
        {!slots || slots.length === 0 ? (
          /* Consistent empty state card — matches rest of page */
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-3">
              <BookOpen size={20} className="text-[var(--brand)]" />
            </div>
            <p className="text-[13px] font-semibold text-[var(--text)] mb-1">No available slots</p>
            <p className="text-[12px] text-[var(--muted)]">Check back soon — staff add new slots regularly.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {slots.map(slot => {
              const staff = slot.profiles as any
              return (
                <div key={slot.id} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-[var(--brand-light)] flex items-center justify-center flex-shrink-0">
                        <CalendarDays size={16} className="text-[var(--brand)]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-bold">
                          {fmtDate(slot.slot_date)} · {slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}
                        </div>
                        <div className="text-[12px] text-[var(--muted)] mt-0.5">
                          {slot.label && <span className="mr-2">{slot.label}</span>}
                          with {staff?.full_name ?? 'CDC Staff'}
                        </div>
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
          /* Consistent empty state card — was a bare <p> before */
          <div className="bg-white rounded-2xl border border-[var(--border)] p-8 text-center">
            <p className="text-[13px] text-[var(--muted)]">No appointments yet. Book a slot above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map(booking => {
              const slot  = booking.appointment_slots as any
              const staff = slot?.profiles as any
              const { label, bg, color } = STATUS_STYLE[booking.status as BookingStatus]
              return (
                <div key={booking.id} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-bold">
                        {slot ? `${fmtDate(slot.slot_date)} · ${slot.start_time?.slice(0,5)}–${slot.end_time?.slice(0,5)}` : '—'}
                      </div>
                      <div className="text-[12px] text-[var(--muted)] mt-0.5">
                        {slot?.label && <span className="mr-2">{slot.label}</span>}
                        with {staff?.full_name ?? 'CDC Staff'}
                      </div>
                      {booking.reason && <p className="text-[12px] text-[var(--muted)] mt-1 italic">{booking.reason}</p>}
                      {booking.staff_notes && (
                        <p className="text-[12px] text-[var(--brand)] mt-1 font-medium">Note: {booking.staff_notes}</p>
                      )}

                      {/* Promoted "Add to calendar" — proper button, not tiny text link */}
                      {booking.status === 'confirmed' && (
                        <div className="flex items-center gap-2 mt-3">
                          <a href={`/api/appointments/ical?bookingId=${booking.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
                              border border-[var(--border)] bg-[var(--bg)] text-[var(--text-2)]
                              hover:border-[var(--border-strong)] transition-colors">
                            <CalendarPlus size={13} className="text-[var(--brand)]" />
                            Add to calendar
                          </a>
                          <CancelBookingButton bookingId={booking.id} />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{ background: bg, color }}>{label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}
