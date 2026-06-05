import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { CreateSlotForm, CompleteBookingButton } from './_actions'

export default async function StaffAppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Own upcoming slots
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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/staff/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}><button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button></form>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-8">My appointment slots</h1>

        {/* Add slot form */}
        <div className="bg-white border border-[#e5e4df] rounded-xl p-5 mb-8">
          <div className="text-[13px] font-bold mb-4">Add availability slot</div>
          <CreateSlotForm />
        </div>

        {/* Upcoming slots */}
        <div className="space-y-3">
          {!slots || slots.length === 0 ? (
            <p className="text-[13px] text-[#888]">No upcoming slots. Add one above.</p>
          ) : (
            slots.map(slot => {
              const booking = bookingMap[slot.id]
              const student = booking?.profiles as any
              return (
                <div key={slot.id} className="bg-white border border-[#e5e4df] rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[14px] font-bold">
                        {fmtDate(slot.slot_date)} · {slot.start_time.slice(0,5)}–{slot.end_time.slice(0,5)}
                      </div>
                      {slot.label && <div className="text-[12px] text-[#888] mt-0.5">{slot.label}</div>}
                      {booking && (
                        <div className="mt-2 text-[12.5px]">
                          <span className="font-semibold">{student?.full_name ?? 'Unknown student'}</span>
                          {student?.faculty && <span className="text-[#888] ml-2">· {student.faculty}</span>}
                          {booking.reason && <p className="text-[12px] text-[#666] mt-1 italic">{booking.reason}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {slot.is_available ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56]">Available</span>
                      ) : booking ? (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAEEDA] text-[#854F0B]">Booked</span>
                          {booking.status !== 'completed' && (
                            <CompleteBookingButton bookingId={booking.id} />
                          )}
                          {booking.status === 'completed' && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5]">Completed</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#f0efe9] text-[#888]">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
