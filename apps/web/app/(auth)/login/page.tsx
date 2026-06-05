import { LoginForm } from '@/features/auth/components/login-form'

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error, reset } = await searchParams

  return (
    <>
      {error === 'auth_callback_failed' && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700 text-center">
          The link has expired or is invalid. Please try again.
        </div>
      )}
      {reset === '1' && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[#E1F5EE] border border-[#c2e8d8] text-[#0F6E56] text-[12.5px] text-center">
          ✓ Password updated successfully. Please sign in with your new password.
        </div>
      )}
      <LoginForm next={next} />
    </>
  )
}
