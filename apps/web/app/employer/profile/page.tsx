'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { updateEmployerProfile, type UpdateProfileState } from '@/features/profile/actions/update-profile'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/features/auth/actions/sign-out'

const INDUSTRIES = ['Technology & IT', 'Banking & Finance', 'Consulting', 'FMCG / Retail',
  'Manufacturing', 'Healthcare', 'Law', 'Media & Marketing', 'Public sector / NGO', 'Other']
const SIZES = ['1–10 employees', '11–50 employees', '51–200 employees', '200+ employees']

export default function EmployerProfilePage() {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(updateEmployerProfile, {})
  const [data, setData] = useState<any>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      Promise.all([
        supabase.from('profiles').select('full_name').eq('id', user.id).single(),
        supabase.from('employers').select('company_name, industry, website, company_size, contact_title').eq('id', user.id).single(),
      ]).then(([{ data: profile }, { data: employer }]) => {
        setData({ ...profile, ...employer })
      })
    })
  }, [])

  if (!data) {
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
          <Link href="/employer/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-6">Company profile</h1>

        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">{state.error}</div>
          )}
          {state.success && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[12.5px]">✓ Profile updated.</div>
          )}

          <div className="mb-5 pb-5 border-b border-[#e5e4df]">
            <div className="text-[12px] font-bold text-[#444] mb-1.5">Email</div>
            <div className="text-[13px] text-[#888]">{email}</div>
          </div>

          <form action={action} className="space-y-4">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] pb-2 border-b border-[#e5e4df]">
              Contact person
            </div>
            <F label="Full name *">
              <input type="text" name="full_name" required defaultValue={data.full_name ?? ''} className={ic} />
            </F>
            <F label="Job title">
              <input type="text" name="contact_title" defaultValue={data.contact_title ?? ''} placeholder="e.g. HR Manager" className={ic} />
            </F>

            <div className="text-[11px] font-bold uppercase tracking-wider text-[#aaa] pt-2 pb-2 border-b border-[#e5e4df]">
              Company details
            </div>
            <F label="Company name *">
              <input type="text" name="company_name" required defaultValue={data.company_name ?? ''} className={ic} />
            </F>
            <div className="grid grid-cols-2 gap-4">
              <F label="Industry">
                <select name="industry" defaultValue={data.industry ?? ''} className={ic}>
                  <option value="">Select industry</option>
                  {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                </select>
              </F>
              <F label="Company size">
                <select name="company_size" defaultValue={data.company_size ?? ''} className={ic}>
                  <option value="">Select size</option>
                  {SIZES.map(s => <option key={s}>{s}</option>)}
                </select>
              </F>
            </div>
            <F label="Website">
              <input type="url" name="website" defaultValue={data.website ?? ''} placeholder="https://company.com" className={ic} />
            </F>

            <button type="submit" disabled={pending}
              className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
                bg-[#0F6E56] hover:opacity-90 transition-opacity disabled:opacity-60">
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[#444] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white focus:outline-none focus:border-[#0F6E56] transition-colors'
