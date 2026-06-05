'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/navigation'
import { redirect } from 'next/navigation'

export type AnnouncementState = { error?: string }

export async function saveAnnouncement(
  _prev: AnnouncementState,
  formData: FormData
): Promise<AnnouncementState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string
  if (role !== 'staff' && role !== 'admin') return { error: 'Unauthorised.' }

  const id      = formData.get('id') as string | null
  const title   = formData.get('title') as string
  const body    = formData.get('body') as string
  const icon    = (formData.get('icon') as string) || 'info'
  const color   = (formData.get('color') as string) || 'blue'
  const publish = formData.get('is_published') === 'true'

  if (!title || !body) return { error: 'Title and body are required.' }

  if (id) {
    await supabase.from('announcements').update({ title, body, icon, color, is_published: publish }).eq('id', id)
  } else {
    await supabase.from('announcements').insert({
      title, body, icon, color, is_published: publish, created_by: user.id,
    })
  }

  revalidatePath('/admin/announcements')
  revalidatePath('/student/dashboard')
  redirect('/admin/announcements')
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('announcements').delete().eq('id', id)
  revalidatePath('/admin/announcements')
  revalidatePath('/student/dashboard')
}
