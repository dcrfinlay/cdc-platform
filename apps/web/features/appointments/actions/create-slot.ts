'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreateSlotState = { error?: string; success?: boolean }

export async function createSlot(
  _prev: CreateSlotState,
  formData: FormData
): Promise<CreateSlotState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') return { error: 'Unauthorised.' }

  const slotDate  = formData.get('slot_date') as string
  const startTime = formData.get('start_time') as string
  const endTime   = formData.get('end_time') as string
  const label     = (formData.get('label') as string) || null

  if (!slotDate || !startTime || !endTime) return { error: 'Date and times are required.' }
  if (startTime >= endTime) return { error: 'Start time must be before end time.' }

  const { error } = await supabase.from('appointment_slots').insert({
    staff_id:   user.id,
    slot_date:  slotDate,
    start_time: startTime,
    end_time:   endTime,
    label,
  })

  if (error) return { error: 'Failed to create slot.' }

  revalidatePath('/staff/appointments')
  return { success: true }
}
