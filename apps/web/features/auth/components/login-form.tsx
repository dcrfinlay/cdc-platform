'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type SignInState } from '@/features/auth/actions/sign-in'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'

interface LoginFormProps {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {})

  return (
    <div>
      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1 tracking-tight">Welcome back</h1>
      <p className="text-[14px] text-[var(--muted)] mb-8">Sign in to your Career Centre account.</p>

      {state.error && (
        <div className="mb-6 flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        {next && <input type="hidden" name="next" value={next} />}

        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="your@university.uz"
            required
            autoComplete="email"
            className="w-full px-4 py-3 text-[14px] border border-[var(--border)] rounded-xl
              bg-[var(--bg)] focus:outline-none focus:border-[var(--brand)] focus:bg-white
              focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-[var(--placeholder)]"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-[12.5px] font-semibold text-[var(--text-2)]">
              Password
            </label>
            <Link href="/forgot-password"
              className="text-[12px] text-[var(--brand)] hover:underline font-medium">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full px-4 py-3 text-[14px] border border-[var(--border)] rounded-xl
              bg-[var(--bg)] focus:outline-none focus:border-[var(--brand)] focus:bg-white
              focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-[var(--placeholder)]"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-[var(--brand)] hover:bg-[#1352914d] transition-all disabled:opacity-60 shadow-sm
            hover:shadow-md active:scale-[0.99] mt-2"
          style={{ background: pending ? undefined : 'var(--brand)' }}
        >
          {pending ? (
            <><Loader2 size={16} className="animate-spin" /> Signing in…</>
          ) : (
            <><span>Sign in</span><ArrowRight size={16} /></>
          )}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[var(--border)] text-center text-[13px] text-[var(--muted)]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[var(--brand)] font-semibold hover:underline">
          Create account
        </Link>
      </div>
    </div>
  )
}
