'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateEmployerProfile, type UpdateProfileState } from '@/features/profile/actions/update-profile'
import { createClient } from '@/lib/supabase/client'

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="text-[13px] text-[var(--muted)]">Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Company profile</h1>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-7 shadow-[var(--shadow-sm)]">
        {state.error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-[12.5px] text-red-700">{state.error}</div>
        )}
        {state.success && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[12.5px]">✓ Profile updated.</div>
        )}

        <div className="mb-5 pb-5 border-b border-[var(--border)]">
          <div className="text-[12px] font-bold text-[var(--text-2)] mb-1.5">Email</div>
          <div className="text-[13px] text-[var(--muted)]">{email}</div>
        </div>

        <form action={action} className="space-y-4">
          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] pb-2 border-b border-[var(--border)]">
            Contact person
          </div>
          <F label="Full name *">
            <input type="text" name="full_name" required defaultValue={data.full_name ?? ''} className={ic} />
          </F>
          <F label="Job title">
            <input type="text" name="contact_title" defaultValue={data.contact_title ?? ''} placeholder="e.g. HR Manager" className={ic} />
          </F>

          <div className="text-[11px] font-bold uppercase tracking-widest text-[var(--subtle)] pt-2 pb-2 border-b border-[var(--border)]">
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
            className="w-full py-3 rounded-xl text-[13.5px] font-bold text-white
              bg-[var(--green)] hover:opacity-90 transition-opacity disabled:opacity-60">
            {pending ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-bold text-[var(--text-2)] mb-1.5">{label}</label>
      {children}
    </div>
  )
}
const ic = 'w-full px-3 py-2.5 text-[13px] border border-[var(--border)] rounded-xl bg-white focus:outline-none focus:border-[var(--green)] focus:ring-4 focus:ring-green-50 transition-all'
