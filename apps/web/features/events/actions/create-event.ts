'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { EventType } from '@/lib/types/database.types'

export type CreateEventState = {
  error?: string
}

export async function createEvent(
  _prev: CreateEventState,
  formData: FormData
): Promise<CreateEventState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') return { error: 'Unauthorised.' }

  const title       = formData.get('title') as string
  const description = (formData.get('description') as string) || null
  const type        = formData.get('type') as EventType
  const eventDate   = formData.get('event_date') as string
  const endDate     = (formData.get('end_date') as string) || null
  const location    = (formData.get('location') as string) || null
  const isOnline    = formData.get('is_online') === 'true'
  const capacityRaw = formData.get('capacity') as string
  const capacity    = capacityRaw ? parseInt(capacityRaw, 10) : null
  const publish     = formData.get('publish') === 'true'

  if (!title || !eventDate || !type) {
    return { error: 'Title, type, and date are required.' }
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title,
      description,
      type,
      event_date:   eventDate,
      end_date:     endDate,
      location,
      is_online:    isOnline,
      capacity,
      is_published: publish,
      created_by:   user.id,
    })
    .select('id')
    .single()

  if (error || !data) {
    return { error: 'Failed to create event. Please try again.' }
  }

  redirect(`/staff/events/${data.id}?created=1`)
}
