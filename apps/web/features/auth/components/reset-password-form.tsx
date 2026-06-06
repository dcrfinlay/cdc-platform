'use client'

import { useActionState } from 'react'
import { resetPassword, type ResetPasswordState } from '@/features/auth/actions/reset-password'
import { AlertCircle, ArrowRight, Loader2, KeyRound } from 'lucide-react'

export function ResetPasswordForm() {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(resetPassword, {})

  return (
    <div>
      <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mb-6">
        <KeyRound size={24} className="text-[var(--brand)]" />
      </div>
      <h1 className="text-[28px] font-bold text-[var(--text)] mb-1 tracking-tight">Set new password</h1>
      <p className="text-[14px] text-[var(--muted)] mb-8">Choose a strong password for your account.</p>

      {state.error && (
        <div className="mb-5 flex gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-5">
        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">New password</label>
          <input type="password" name="password" placeholder="Min. 8 characters"
            required minLength={8} autoComplete="new-password"
            className={ic} />
        </div>
        <div>
          <label className="block text-[12.5px] font-semibold text-[var(--text-2)] mb-2">Confirm new password</label>
          <input type="password" name="confirm_password" placeholder="Repeat your password"
            required minLength={8} autoComplete="new-password"
            className={ic} />
        </div>
        <button type="submit" disabled={pending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-[var(--brand)] hover:opacity-90 transition-opacity disabled:opacity-60 shadow-sm">
          {pending
            ? <><Loader2 size={16} className="animate-spin" /> Updating…</>
            : <><span>Update password</span><ArrowRight size={16} /></>
          }
        </button>
      </form>
    </div>
  )
}

const ic = `w-full px-4 py-3 text-[14px] border border-[var(--border)] rounded-xl
  bg-[var(--bg)] focus:outline-none focus:border-[var(--brand)] focus:bg-white
  focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-[var(--placeholder)]`
