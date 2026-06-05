import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

// Called when a QR code is scanned — marks the student as attended.
// Uses admin client because the request comes from a scanner (no user session).
// Token is single-use: repeated scans return the same success response.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Missing token.' }, { status: 400 })
  }

  const admin = createAdminClient()

  const { data: reg, error } = await admin
    .from('event_registrations')
    .select('id, attended_at, event_id, student_id, events(title), profiles(full_name)')
    .eq('qr_token', token)
    .single()

  if (error || !reg) {
    return NextResponse.json({ error: 'Invalid QR code.' }, { status: 404 })
  }

  const alreadyMarked = !!reg.attended_at

  if (!alreadyMarked) {
    await admin
      .from('event_registrations')
      .update({ attended_at: new Date().toISOString() })
      .eq('id', reg.id)
  }

  const event   = reg.events   as any
  const profile = reg.profiles as any

  return NextResponse.json({
    success:        true,
    already_marked: alreadyMarked,
    student:        profile?.full_name  ?? 'Unknown',
    event:          event?.title        ?? 'Unknown event',
    marked_at:      alreadyMarked ? reg.attended_at : new Date().toISOString(),
  })
}
