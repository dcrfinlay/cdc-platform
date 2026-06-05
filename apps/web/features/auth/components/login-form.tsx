'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { signIn, type SignInState } from '@/features/auth/actions/sign-in'

interface LoginFormProps {
  next?: string
}

export function LoginForm({ next }: LoginFormProps) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {})

  return (
    <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
      <h1 className="text-[19px] font-bold mb-1">Welcome back</h1>
      <p className="text-[13px] text-[#666] mb-6">Sign in to your Career Centre account.</p>

      {state.error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        {next && <input type="hidden" name="next" value={next} />}

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

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[12px] font-bold text-[#444]">
              Password
            </label>
            <Link
              href="/magic-link"
              className="text-[11.5px] text-[#185FA5] hover:underline"
            >
              Sign in with magic link
            </Link>
          </div>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
            className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg
              focus:outline-none focus:border-[#185FA5] transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 rounded-lg text-[13.5px] font-bold text-white
            bg-[#185FA5] hover:opacity-90 transition-opacity disabled:opacity-60
            mt-2"
        >
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-5 text-center text-[12.5px] text-[#666]">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-[#185FA5] font-semibold hover:underline">
          Create account
        </Link>
      </p>
    </div>
  )
}
