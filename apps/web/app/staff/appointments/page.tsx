import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CreateSlotForm, CompleteBookingButton } from './_actions'

export default async function StaffAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: slots } = await supabase
    .from('appointment_slots')
    .select('id, slot_date, start_time, end_time, label, is_available')
    .eq('staff_id', user.id)
    .gte('slot_date', new Date().toISOString().split('T')[0])
    .order('slot_date').order('start_time')

  const bookedSlotIds = (slots ?? []).filter(s => !s.is_available).map(s => s.id)

  const { data: bookings } = bookedSlotIds.length
    ? await supabase
        .from('bookings')
        .select('id, status, reason, created_at, slot_id, profiles(full_name, faculty)')
        .in('slot_id', bookedSlotIds)
        .neq('status', 'cancelled')
    : { data: [] }

  const bookingMap = Object.fromEntries((bookings ?? []).map(b => [b.slot_id, b]))

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">My appointment slots</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">Manage your availability and upcoming bookings.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 mb-6 shadow-[var(--shadow-sm)]">
        <div className="text-[13px] font-bold mb-4">Add availability slot</div>
        <CreateSlotForm />
      </div>

      <div className="space-y-3">
        {!slots || slots.length === 0 ? (
          <p className="text-[13px] text-[var(--muted)]">No upcoming slots. Add one above.</p>
        ) : (
          slots.map(slot => {
            const booking = bookingMap[slot.id]
            const student = booking?.profiles as any
            return (
              <div key={slot.id} className="bg-white rounded-2xl border border-[var(--border)] p-5 shadow-[var(--shadow-sm)]">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[14px] font-bold">
                      {fmtDate(slot.slot_date)} · {slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}
                    </div>
                    {slot.label && <div className="text-[12px] text-[var(--muted)] mt-0.5">{slot.label}</div>}
                    {booking && (
                      <div className="mt-2 text-[12.5px]">
                        <span className="font-semibold">{student?.full_name ?? 'Unknown student'}</span>
                        {student?.faculty && <span className="text-[var(--muted)] ml-2">· {student.faculty}</span>}
                        {booking.reason && <p className="text-[12px] text-[var(--muted)] mt-1 italic">{booking.reason}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {slot.is_available ? (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--green-light)] text-[var(--green)]">Available</span>
                    ) : booking ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--amber-light)] text-[var(--amber)]">Booked</span>
                        {booking.status !== 'completed' && <CompleteBookingButton bookingId={booking.id} />}
                        {booking.status === 'completed' && (
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--brand-light)] text-[var(--brand)]">Completed</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[var(--muted)]">Unavailable</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
