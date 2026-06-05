import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { LetterForm } from '@/features/internship-letters/components/letter-form'
import { signOut } from '@/features/auth/actions/sign-out'

export default async function NewLetterPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, phone, faculty, year_of_study')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <Link href="/student/letters" className="hover:text-[#185FA5]">Internship letters</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">New request</span>
        </div>

        <div className="bg-white border border-[#e5e4df] rounded-xl p-7">
          <h1 className="text-[19px] font-bold mb-1">Request an internship letter</h1>
          <p className="text-[13px] text-[#666] mb-6 leading-relaxed">
            Fill in the details below. Your letter will be ready within 48 hours.
          </p>
          <LetterForm
            defaultValues={{
              full_name:     profile?.full_name,
              phone:         profile?.phone,
              faculty:       profile?.faculty,
              year_of_study: profile?.year_of_study,
              email:         user.email,
            }}
          />
        </div>
      </div>
    </div>
  )
}
