import { SignUpForm } from '@/features/auth/components/signup-form'

interface SignUpPageProps {
  searchParams: Promise<{ role?: string }>
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const { role } = await searchParams
  const defaultRole = role === 'employer' ? 'employer' : 'student'

  return <SignUpForm defaultRole={defaultRole} />
}
