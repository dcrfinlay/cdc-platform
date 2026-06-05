'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type BookSlotState = { error?: string }

export async function bookSlot(
  _prev: BookSlotState,
  formData: FormData
): Promise<BookSlotState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const slotId = formData.get('slot_id') as string
  const reason = (formData.get('reason') as string) || null

  if (!slotId) return { error: 'Invalid slot.' }

  // Verify slot is still available
  const { data: slot } = await supabase
    .from('appointment_slots')
    .select('is_available')
    .eq('id', slotId)
    .single()

  if (!slot?.is_available) return { error: 'This slot is no longer available.' }

  const { error } = await supabase.from('bookings').insert({
    slot_id:    slotId,
    student_id: user.id,
    reason,
    status:     'confirmed',
  })

  if (error) {
    if (error.message.includes('unique')) return { error: 'This slot has just been booked.' }
    return { error: 'Booking failed. Please try again.' }
  }

  redirect('/student/appointments?booked=1')
}

export async function cancelBooking(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('student_id', user.id)

  revalidatePath('/student/appointments')
}

// Import needed for cancelBooking
import { revalidatePath } from 'next/cache'
