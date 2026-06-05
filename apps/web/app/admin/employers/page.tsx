import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { EmployerApprovalButton } from './_actions'

export default async function AdminEmployersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: employers } = await admin
    .from('employers')
    .select('id, company_name, industry, website, approved, approved_at, profiles(full_name)')
    .order('approved')
    .order('approved_at', { ascending: false, nullsFirst: true })

  const pending  = (employers ?? []).filter(e => !e.approved)
  const approved = (employers ?? []).filter(e =>  e.approved)

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}><button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button></form>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-[22px] font-bold mb-8">Employer management</h1>

        {/* Pending */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[15px] font-bold">Pending approval</h2>
            {pending.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#FAEEDA] text-[#854F0B] text-[10px] font-bold">
                {pending.length}
              </span>
            )}
          </div>
          {pending.length === 0 ? (
            <p className="text-[13px] text-[#888]">No pending employers.</p>
          ) : (
            <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
              {pending.map((emp, i) => (
                <div key={emp.id} className={`p-5 flex items-center justify-between gap-4 ${i > 0 ? 'border-t border-[#e5e4df]' : ''}`}>
                  <div>
                    <div className="text-[14px] font-bold">{emp.company_name}</div>
                    <div className="text-[12px] text-[#888] mt-0.5">
                      {(emp.profiles as any)?.full_name}
                      {emp.industry && <span className="ml-2">· {emp.industry}</span>}
                      {emp.website && <a href={emp.website} target="_blank" rel="noopener noreferrer"
                        className="ml-2 text-[#185FA5] hover:underline">↗ {emp.website}</a>}
                    </div>
                  </div>
                  <EmployerApprovalButton employerId={emp.id} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Approved */}
        <section>
          <h2 className="text-[15px] font-bold mb-4">Approved employers ({approved.length})</h2>
          {approved.length === 0 ? (
            <p className="text-[13px] text-[#888]">No approved employers yet.</p>
          ) : (
            <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Company</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Industry</th>
                    <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Approved</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {approved.map((emp, i) => (
                    <tr key={emp.id} className={`border-b border-[#e5e4df] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                      <td className="px-5 py-3.5 font-semibold">{emp.company_name}</td>
                      <td className="px-5 py-3.5 text-[#666] hidden sm:table-cell">{emp.industry ?? '—'}</td>
                      <td className="px-5 py-3.5 text-[12px] text-[#888] hidden md:table-cell">
                        {emp.approved_at ? new Date(emp.approved_at).toLocaleDateString('en-GB') : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <EmployerApprovalButton employerId={emp.id} isApproved />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
