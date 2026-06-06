'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateStudentProfile, type UpdateProfileState } from '@/features/profile/actions/update-profile'
import { createClient } from '@/lib/supabase/client'

export default function StaffProfilePage() {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(updateStudentProfile, {})
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail]     = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles').select('full_name, phone').eq('id', user.id).single()
        .then(({ data }) => setProfile(data))
    })
  }, [])

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--surface)' }}>
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">My profile</h1>
      </div>
      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        {state.error   && <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700">{state.error}</div>}
        {state.success && <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[12.5px]">✓ Profile updated.</div>}

        <div className="mb-5 pb-5 border-b border-[var(--border)]">
          <div className="text-[12px] font-bold text-[var(--text-2)] mb-1">Email</div>
          <div className="text-[13px] text-[var(--muted)]">{email}</div>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">Full name *</label>
            <input type="text" name="full_name" required defaultValue={profile.full_name ?? ''}
              className="w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all" />
          </div>
          <div>
            <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">Phone number</label>
            <input type="tel" name="phone" defaultValue={profile.phone ?? ''} placeholder="+998 90 123 45 67"
              className="w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl focus:outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-blue-50 transition-all" />
          </div>
          <button type="submit" disabled={pending}
            className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white bg-[var(--brand)] hover:opacity-90 disabled:opacity-60">
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
