'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { updateStudentProfile, type UpdateProfileState } from '@/features/profile/actions/update-profile'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/features/auth/actions/sign-out'

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
        <p className="text-[13px] text-[#888]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/staff/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-6">My profile</h1>
        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error   && <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">{state.error}</div>}
          {state.success && <div className="mb-5 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[12.5px]">✓ Profile updated.</div>}

          <div className="mb-5 pb-5 border-b border-[#e5e4df]">
            <div className="text-[12px] font-bold text-[#444] mb-1">Email</div>
            <div className="text-[13px] text-[#888]">{email}</div>
          </div>

          <form action={action} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[#444] mb-1.5">Full name *</label>
              <input type="text" name="full_name" required defaultValue={profile.full_name ?? ''}
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#444] mb-1.5">Phone number</label>
              <input type="tel" name="phone" defaultValue={profile.phone ?? ''} placeholder="+998 90 123 45 67"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]" />
            </div>
            <button type="submit" disabled={pending}
              className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white bg-[#185FA5] hover:opacity-90 disabled:opacity-60">
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
