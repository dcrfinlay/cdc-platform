'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type RegisterEventState = {
  error?: string
  success?: boolean
}

export async function registerForEvent(
  _prev: RegisterEventState,
  formData: FormData
): Promise<RegisterEventState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const eventId = formData.get('event_id') as string
  if (!eventId) return { error: 'Invalid event.' }

  // Use the atomic DB function to prevent over-registration
  const { error } = await supabase.rpc('register_for_event', {
    p_event_id: eventId,
  })

  if (error) {
    if (error.message.includes('ALREADY_REGISTERED')) {
      return { error: 'You are already registered for this event.' }
    }
    if (error.message.includes('EVENT_FULL')) {
      return { error: 'Sorry, this event is now fully booked.' }
    }
    if (error.message.includes('EVENT_NOT_FOUND')) {
      return { error: 'Event not found or no longer available.' }
    }
    return { error: 'Registration failed. Please try again.' }
  }

  redirect(`/student/events/${eventId}?registered=1`)
}
