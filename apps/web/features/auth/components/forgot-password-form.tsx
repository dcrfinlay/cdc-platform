'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { forgotPassword, type ForgotPasswordState } from '@/features/auth/actions/forgot-password'

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(
    forgotPassword,
    {}
  )

  if (state.success) {
    return (
      <div className="bg-white border border-[#e5e4df] rounded-xl p-7 text-center">
        <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#185FA5] text-xl">✉</span>
        </div>
        <h2 className="text-[17px] font-bold mb-2">Check your email</h2>
        <p className="text-[13px] text-[#666] leading-relaxed">
          If an account exists for that email, we&apos;ve sent a password reset link.
          It expires in 1 hour.
        </p>
        <Link href="/login"
          className="mt-5 inline-block text-[12.5px] text-[#185FA5] font-semibold hover:underline">
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
      <h1 className="text-[19px] font-bold mb-1">Forgot password?</h1>
      <p className="text-[13px] text-[#666] mb-6 leading-relaxed">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      {state.error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">
            Email address
          </label>
          <input
            type="email"
            name="email"
            placeholder="your@university.uz"
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
            bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-[#666]">
        Remembered it?{' '}
        <Link href="/login" className="text-[#185FA5] font-semibold hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
