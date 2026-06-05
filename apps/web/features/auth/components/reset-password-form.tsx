'use client'

import { useActionState } from 'react'
import { resetPassword, type ResetPasswordState } from '@/features/auth/actions/reset-password'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetPassword,
    {}
  )

  return (
    <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
      <h1 className="text-[19px] font-bold mb-1">Set new password</h1>
      <p className="text-[13px] text-[#666] mb-6">Choose a strong password for your account.</p>

      {state.error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">
            New password
          </label>
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
        <div>
          <label className="block text-[12px] font-bold text-[#444] mb-1.5">
            Confirm new password
          </label>
          <input
            type="password"
            name="confirm_password"
            placeholder="Repeat your password"
            required
            minLength={8}
            autoComplete="new-password"
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
          {pending ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </div>
  )
}
