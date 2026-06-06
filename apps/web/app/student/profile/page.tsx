'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { updateStudentProfile, type UpdateProfileState } from '@/features/profile/actions/update-profile'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/features/auth/actions/sign-out'

const FACULTIES = ['Economics', 'Law', 'Engineering', 'Business', 'IT', 'Medicine', 'Other']
const YEARS     = ['1st year', '2nd year', '3rd year', '4th year', 'Masters', 'PhD']
const GRAD_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2)

export default function StudentProfilePage() {
  const [state, action, pending] = useActionState<UpdateProfileState, FormData>(updateStudentProfile, {})
  const [profile, setProfile]   = useState<any>(null)
  const [email, setEmail]       = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills]     = useState<string[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setEmail(user.email ?? '')
      supabase.from('profiles')
        .select('full_name, phone, faculty, year_of_study, graduation_year, degree, skills')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          setProfile(data)
          setSkills(data?.skills ?? [])
        })
    })
  }, [])

  function addSkill() {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s])
    setSkillInput('')
  }

  function removeSkill(s: string) {
    setSkills(prev => prev.filter(x => x !== s))
  }

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
          <Link href="/student/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">My profile</span>
        </div>

        <h1 className="text-[22px] font-bold mb-6">My profile</h1>

        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          {state.error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
              {state.error}
            </div>
          )}
          {state.success && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[12.5px]">
              ✓ Profile updated.
            </div>
          )}

          {/* Read-only email */}
          <div className="mb-5 pb-5 border-b border-[#e5e4df]">
            <div className="text-[12px] font-bold text-[#444] mb-1.5">Email address</div>
            <div className="text-[13px] text-[#888]">{email}</div>
            <div className="text-[11px] text-[#aaa] mt-1">Email cannot be changed here.</div>
          </div>

          <form action={action} className="space-y-4">
            {/* Hidden skills value */}
            <input type="hidden" name="skills" value={skills.join(',')} />

            <F label="Full name *">
              <input type="text" name="full_name" required defaultValue={profile.full_name ?? ''}
                placeholder="As on your student ID" className={ic} />
            </F>

            <div className="grid grid-cols-2 gap-4">
              <F label="Faculty">
                <select name="faculty" defaultValue={profile.faculty ?? ''} className={ic}>
                  <option value="">Select faculty</option>
                  {FACULTIES.map(f => <option key={f}>{f}</option>)}
                </select>
              </F>
              <F label="Year of study">
                <select name="year_of_study" defaultValue={profile.year_of_study ?? ''} className={ic}>
                  <option value="">Select year</option>
                  {YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </F>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <F label="Degree / programme">
                <input type="text" name="degree" defaultValue={profile.degree ?? ''}
                  placeholder="e.g. Business Administration" className={ic} />
              </F>
              <F label="Graduation year">
                <select name="graduation_year" defaultValue={profile.graduation_year ?? ''} className={ic}>
                  <option value="">Select year</option>
                  {GRAD_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </F>
            </div>

            <F label="Phone number">
              <input type="tel" name="phone" defaultValue={profile.phone ?? ''}
                placeholder="+998 90 123 45 67" className={ic} />
            </F>

            {/* Skills */}
            <div>
              <label className="block text-[12px] font-bold text-[#444] mb-1.5">
                Skills
                <span className="ml-1 font-normal text-[#888]">(shown to employers)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                  placeholder="e.g. Python, Excel, Figma…"
                  className={ic + ' flex-1'}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-3 py-2 rounded-lg text-[12.5px] font-bold bg-[#E6F1FB] text-[#185FA5] hover:bg-[#d0e6f7]"
                >
                  Add
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(s => (
                    <span key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[11px] font-semibold">
                      {s}
                      <button
                        type="button"
                        onClick={() => removeSkill(s)}
                        className="text-[#185FA5] hover:text-red-500 font-bold leading-none"
                      >×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={pending}
              className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
                bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60">
              {pending ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* CV visibility note */}
        <div className="mt-4 px-4 py-3 rounded-lg bg-[#FAEEDA] border border-[#f0d9b5] text-[12px] text-[#854F0B]">
          💡 To appear in employer CV search, upload your CV and enable visibility on the{' '}
          <Link href="/student/resume" className="font-bold underline">Resume page</Link>.
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
const ic = 'w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg bg-white focus:outline-none focus:border-[#185FA5] transition-colors'
