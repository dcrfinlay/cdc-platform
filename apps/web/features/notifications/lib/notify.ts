import { createAdminClient } from '@/lib/supabase/admin'
import type { NotificationType } from '@/lib/types/database.types'

interface NotifyParams {
  userId: string
  type: NotificationType
  title: string
  body?: string
  link?: string
}

// Fire-and-forget — call from any server action without awaiting
export async function notify(params: NotifyParams) {
  try {
    const admin = createAdminClient()
    await admin.from('notifications').insert({
      user_id: params.userId,
      type:    params.type,
      title:   params.title,
      body:    params.body  ?? null,
      link:    params.link  ?? null,
    })
  } catch {
    // Never throw — notifications are non-critical
  }
}
