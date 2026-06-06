'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signUp, type SignUpState } from '@/features/auth/actions/sign-up'
import { AlertCircle, ArrowRight, Loader2, CheckCircle2, GraduationCap, Building2 } from 'lucide-react'

export function SignUpForm({ defaultRole = 'student' }: { defaultRole?: 'student' | 'employer' }) {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, {})
  const [role, setRole] = useState<'student' | 'employer'>(defaultRole)

  if (state.success) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={28} className="text-[var(--brand)]" />
        </div>
        <h2 className="text-[22px] font-bold mb-2">Check your email</h2>
        <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-6">
          We sent a confirmation link to your email address. Click it to activate your account.
        </p>
        <Link href="/login"
          className="inline-flex items-center gap-2 text-[13px] text-[var(--brand)] font-semibold hover:underline">
          ← Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1 tracking-tight">Create account</h1>
      <p className="text-[14px] text-[var(--muted)] mb-7">Join the Career Centre portal.</p>

      {/* Role toggle */}
      <div className="flex rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1 mb-6 gap-1">
        {([
          { value: 'student',  label: 'Student',  Icon: GraduationCap },
          { value: 'employer', label: 'Employer', Icon: Building2     },
        ] as const).map(({ value, label, Icon }) => (
          <button key={value} type="button" onClick={() => setRole(value)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-semibold transition-all
              ${role === value
                ? 'bg-white text-[var(--text)] shadow-sm border border-[var(--border)]'
                : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}>
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {state.error && (
        <div className="mb-5 flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Full name</label>
          <input type="text" name="full_name" placeholder="As on your ID" required autoComplete="name"
            className={ic} />
        </div>

        {role === 'employer' && (
          <div>
            <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Company name</label>
            <input type="text" name="company_name" placeholder="e.g. Uzum Market" required className={ic} />
          </div>
        )}

        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Email address</label>
          <input type="email" name="email"
            placeholder={role === 'student' ? 'your@university.uz' : 'hr@company.uz'}
            required autoComplete="email" className={ic} />
        </div>

        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Password</label>
          <input type="password" name="password" placeholder="Min. 8 characters"
            required minLength={8} autoComplete="new-password" className={ic} />
        </div>

        {role === 'employer' && (
          <div className="flex gap-2.5 px-4 py-3 rounded-xl bg-[var(--amber-light)] text-[var(--amber)] text-[12px]">
            <span className="flex-shrink-0 mt-0.5">⏳</span>
            Employer accounts require approval before full access is granted. You'll be notified within 2 working days.
          </div>
        )}

        <button type="submit" disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-[var(--brand)] hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm mt-1">
          {pending
            ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
            : <><span>Create account</span><ArrowRight size={16} /></>
          }
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-[13px] text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">Sign in</Link>
      </div>
    </div>
  )
}

const ic = `w-full px-4 py-3 text-[14px] border border-[var(--border)] rounded-xl
  bg-[var(--bg)] focus:outline-none focus:border-[var(--brand)] focus:bg-white
  focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-[var(--placeholder)]`
