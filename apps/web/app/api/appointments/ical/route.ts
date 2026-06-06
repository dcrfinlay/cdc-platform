import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/appointments/ical?bookingId=xxx
// Returns a .ics file for a confirmed booking owned by the authenticated student.
export async function GET(req: NextRequest) {
  const bookingId = req.nextUrl.searchParams.get('bookingId')
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
  }

  // Verify caller owns this booking
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: booking } = await admin
    .from('bookings')
    .select(`
      id, reason, status,
      appointment_slots (
        slot_date, start_time, end_time, label,
        profiles ( full_name )
      )
    `)
    .eq('id', bookingId)
    .eq('student_id', user.id)
    .single()

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const slot   = booking.appointment_slots as any
  const staff  = slot?.profiles as any

  if (!slot) {
    return NextResponse.json({ error: 'Slot data missing' }, { status: 500 })
  }

  // Build datetime strings — slot_date is YYYY-MM-DD, times are HH:MM:SS
  const dtStart = icalDate(slot.slot_date, slot.start_time)
  const dtEnd   = icalDate(slot.slot_date, slot.end_time)
  const now     = icalNow()

  const summary    = slot.label ?? 'CDC Appointment'
  const staffName  = staff?.full_name ?? 'CDC Staff'
  const description = [
    booking.reason ? `Reason: ${booking.reason}` : '',
    `With: ${staffName}`,
    'British Management University — Career Development Centre',
  ].filter(Boolean).join('\\n')

  const uid = `booking-${booking.id}@bmu-cdc`

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BMU Career Development Centre//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${icalEscape(summary)}`,
    `DESCRIPTION:${icalEscape(description)}`,
    'LOCATION:British Management University — Career Development Centre',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return new NextResponse(ics, {
    status: 200,
    headers: {
      'Content-Type':        'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="appointment-${bookingId.slice(0,8)}.ics"`,
      'Cache-Control':       'no-store',
    },
  })
}

// ── Helpers ────────────────────────────────────────────────

/** Convert YYYY-MM-DD + HH:MM:SS → iCal local datetime YYYYMMDDTHHMMSS */
function icalDate(date: string, time: string): string {
  const d = date.replace(/-/g, '')
  const t = time.slice(0, 8).replace(/:/g, '')
  return `${d}T${t}`
}

/** Current UTC timestamp in iCal format */
function icalNow(): string {
  return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

/** Escape special characters in iCal text values */
function icalEscape(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g,  '\\;')
    .replace(/,/g,  '\\,')
    .replace(/\n/g, '\\n')
}
