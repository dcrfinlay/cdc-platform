import { LoginForm } from '@/features/auth/components/login-form'

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams

  return (
    <>
      {error === 'auth_callback_failed' && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-[12.5px] text-red-700 text-center">
          The sign-in link has expired or is invalid. Please try again.
        </div>
      )}
      <LoginForm next={next} />
    </>
  )
}
