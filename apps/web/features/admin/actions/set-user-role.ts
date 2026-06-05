'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { UserRole } from '@/lib/types/database.types'

export async function setUserRole(targetUserId: string, newRole: UserRole) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  const role = user.app_metadata?.role as string
  if (role !== 'admin') return { error: 'Only admins can change roles.' }
  if (targetUserId === user.id) return { error: 'You cannot change your own role.' }

  const admin = createAdminClient()

  // Use the DB function which updates both profiles and app_metadata
  await admin.rpc('set_user_role', {
    target_user_id: targetUserId,
    new_role:       newRole,
  })

  await admin.from('audit_logs').insert({
    actor_id:     user.id,
    actor_email:  user.email,
    action:       'user.role_changed',
    target_table: 'profiles',
    target_id:    targetUserId,
    metadata:     { new_role: newRole },
  })

  revalidatePath('/admin/users')
  return { success: true }
}
