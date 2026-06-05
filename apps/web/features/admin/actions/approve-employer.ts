'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { notify } from '@/features/notifications/lib/notify'

export async function approveEmployer(employerId: string, approve: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorised.' }

  const role = user.app_metadata?.role as string
  if (role !== 'admin') return { error: 'Unauthorised.' }

  const admin = createAdminClient()

  await admin.from('employers').update({
    approved:    approve,
    approved_at: approve ? new Date().toISOString() : null,
    approved_by: approve ? user.id : null,
  }).eq('id', employerId)

  // Audit log
  await admin.from('audit_logs').insert({
    actor_id:     user.id,
    actor_email:  user.email,
    action:       approve ? 'employer.approved' : 'employer.rejected',
    target_table: 'employers',
    target_id:    employerId,
  })

  // Notify employer
  if (approve) {
    await notify({
      userId: employerId,
      type:   'employer_approved',
      title:  'Your employer account has been approved',
      body:   'You can now post jobs and internships on the Career Centre portal.',
      link:   '/employer/dashboard',
    })
  }

  revalidatePath('/admin/employers')
  return { success: true }
}
