import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions/sign-out'

export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('company_name, approved')
    .eq('id', user.id)
    .single()

  // Pending approval screen
  if (!employer?.approved) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ background: 'var(--surface)' }}>
        <div className="bg-white border border-[#e5e4df] rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#E1F5EE] flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0F6E56] text-xl">⏳</span>
          </div>
          <h2 className="text-[17px] font-bold mb-2">Account pending approval</h2>
          <p className="text-[13px] text-[#666] leading-relaxed mb-6">
            Your employer account for <strong>{employer?.company_name}</strong> is under review.
            Our team will verify your details and approve access within 2 working days.
          </p>
          <form action={signOut}>
            <button type="submit" className="text-[12.5px] text-[#185FA5] hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <div className="text-[14px] font-bold">Career Centre</div>
        <div className="flex items-center gap-4">
          <span className="text-[12.5px] text-[#666]">{employer.company_name}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E1F5EE] text-[#0F6E56] text-[11px] font-bold mb-4">
          Employer
        </div>
        <h1 className="text-[24px] font-bold mb-2">{employer.company_name}</h1>
        <p className="text-[13px] text-[#666]">
          Employer portal. More features coming soon.
        </p>
      </div>
    </div>
  )
}
