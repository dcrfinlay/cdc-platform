'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword, type ForgotPasswordState } from '@/features/auth/actions/forgot-password'
import { AlertCircle, ArrowRight, Loader2, Mail } from 'lucide-react'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(forgotPassword, {})

  if (state.success) {
    return (
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-[var(--brand)]" />
        </div>
        <h2 className="text-[22px] font-bold mb-2">Check your email</h2>
        <p className="text-[14px] text-[var(--muted)] leading-relaxed mb-6">
          If an account exists for that email, we've sent a password reset link. It expires in 1 hour.
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
      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1 tracking-tight">Forgot password?</h1>
      <p className="text-[14px] text-[var(--muted)] mb-8 leading-relaxed">
        Enter your email and we'll send you a link to reset your password.
      </p>

      {state.error && (
        <div className="mb-5 flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Email address</label>
          <input type="email" name="email" placeholder="your@university.uz" required autoComplete="email"
            className="w-full px-4 py-3 text-[14px] border border-[var(--border)] rounded-xl
              bg-[var(--bg)] focus:outline-none focus:border-[var(--brand)] focus:bg-white
              focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-[var(--placeholder)]" />
        </div>
        <button type="submit" disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-[var(--brand)] hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm">
          {pending
            ? <><Loader2 size={16} className="animate-spin" /> Sending…</>
            : <><span>Send reset link</span><ArrowRight size={16} /></>
          }
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-[13px] text-[var(--muted)]">
        Remembered it?{' '}
        <Link href="/login" className="text-[var(--brand)] font-semibold hover:underline">Back to sign in</Link>
      </div>
    </div>
  )
}
