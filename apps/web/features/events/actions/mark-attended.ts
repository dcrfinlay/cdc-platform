'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markAttended(registrationId: string, attended: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') return { error: 'Unauthorised.' }

  await supabase
    .from('event_registrations')
    .update({ attended_at: attended ? new Date().toISOString() : null })
    .eq('id', registrationId)

  revalidatePath('/staff/events/[id]', 'page')
  return { success: true }
}
