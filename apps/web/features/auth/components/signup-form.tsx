'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { signUp, type SignUpState } from '@/features/auth/actions/sign-up'

export function SignUpForm({ defaultRole = 'student' }: { defaultRole?: 'student' | 'employer' }) {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUp, {})
  const [role, setRole] = useState<'student' | 'employer'>(defaultRole)

  if (state.success) {
    return (
      <div className="bg-white border border-[#e5e4df] rounded-xl p-7 text-center">
        <div className="w-12 h-12 rounded-full bg-[#E6F1FB] flex items-center justify-center mx-auto mb-4">
          <span className="text-[#185FA5] text-xl">✓</span>
        </div>
        <h2 className="text-[17px] font-bold mb-2">Check your email</h2>
        <p className="text-[13px] text-[#666] leading-relaxed">
          We sent a confirmation link to your email address. Click it to activate your account.
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
      <h1 className="text-[19px] font-bold mb-1">Create account</h1>
      <p className="text-[13px] text-[#666] mb-5">Join the Career Centre portal.</p>

      {/* Role toggle */}
      <div className="flex rounded-lg border border-[#e5e4df] p-1 mb-5 gap-1">
        {(['student', 'employer'] as const).map(r => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 py-2 rounded-md text-[12.5px] font-semibold transition-colors capitalize
              ${role === r
                ? 'bg-[#185FA5] text-white'
                : 'text-[#666] hover:text-[#1a1a18]'
              }`}
          >
            {r}
          </button>
        ))}
      </div>

      {state.error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="role" value={role} />

        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">Full name</label>
          <input
            type="text"
            name="full_name"
            placeholder="As on your ID"
            required
            autoComplete="name"
            className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        {role === 'employer' && (
          <div>
            <label className="block text-[12px] font-bold text-[#444] mb-1.5">Company name</label>
            <input
              type="text"
              name="company_name"
              placeholder="e.g. Uzum Market"
              required
              className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
                focus:outline-none focus:border-[#185FA5] transition-colors"
            />
          </div>
        )}

        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">Email address</label>
          <input
            type="email"
            name="email"
            placeholder={role === 'student' ? 'your@university.uz' : 'hr@company.uz'}
            required
            autoComplete="email"
            className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Min. 8 characters"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        {role === 'employer' && (
          <div className="px-3 py-2.5 rounded-lg text-[12px] bg-[#E1F5EE] text-[#0F6E56]">
            Employer accounts require approval before full access is granted. You&apos;ll be notified within 2 working days.
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
            bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60 mt-1"
        >
          {pending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-[#666]">
        Already have an account?{' '}
        <Link href="/login" className="text-[#185FA5] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
