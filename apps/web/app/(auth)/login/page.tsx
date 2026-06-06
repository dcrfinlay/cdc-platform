import { LoginForm } from '@/features/auth/components/login-form'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error, reset } = await searchParams

  return (
    <>
      {error === 'auth_callback_failed' && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-[13px] text-red-700">
          <AlertCircle size={15} className="flex-shrink-0" />
          The link has expired or is invalid. Please try again.
        </div>
      )}
      {reset === '1' && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--green-light)] border border-green-200 text-[13px] text-[var(--green)]">
          <CheckCircle2 size={15} className="flex-shrink-0" />
          Password updated. Please sign in with your new password.
        </div>
      )}
      <LoginForm next={next} />
    </>
  )
}
