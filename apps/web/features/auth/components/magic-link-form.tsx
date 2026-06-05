'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { sendMagicLink, type MagicLinkState } from '@/features/auth/actions/magic-link'

export function MagicLinkForm() {
  const [state, action, pending] = useActionState<MagicLinkState, FormData>(
    sendMagicLink,
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
          If an account exists for that address, we&apos;ve sent a sign-in link. It expires in 1 hour.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block text-[12.5px] text-[#185FA5] font-semibold hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
      <h1 className="text-[19px] font-bold mb-1">Sign in with magic link</h1>
      <p className="text-[13px] text-[#666] mb-6 leading-relaxed">
        Enter your email and we&apos;ll send you a one-click sign-in link — no password needed.
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
          {pending ? 'Sending link…' : 'Send magic link'}
        </button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-[#666]">
        Have your password?{' '}
        <Link href="/login" className="text-[#185FA5] font-semibold hover:underline">
          Sign in instead
        </Link>
      </p>
    </div>
  )
}
