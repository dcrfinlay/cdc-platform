import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { EmployerApprovalButton } from './_actions'
import { Building2, CheckCircle2 } from 'lucide-react'

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
    <div className="p-6 lg:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Employer management</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">
          {pending.length > 0 ? `${pending.length} pending approval` : 'No pending approvals'} · {approved.length} approved
        </p>
      </div>

      {/* Pending */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[15px] font-bold">Pending approval</h2>
          {pending.length > 0 && (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--amber-light)] text-[var(--amber)]">
              {pending.length}
            </span>
          )}
        </div>
        {pending.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-[var(--green-light)] border border-green-200 text-[var(--green)] text-[13px]">
            <CheckCircle2 size={17} />
            All employer requests reviewed — no pending approvals.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--amber-light)] overflow-hidden shadow-[var(--shadow-sm)]">
            {pending.map((emp, i) => (
              <div key={emp.id}
                className={`p-5 flex items-center justify-between gap-4 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold">{emp.company_name}</div>
                  <div className="text-[12px] text-[var(--muted)] mt-0.5 flex flex-wrap gap-2">
                    <span>{(emp.profiles as any)?.full_name}</span>
                    {emp.industry && <span>· {emp.industry}</span>}
                    {emp.website && (
                      <a href={emp.website} target="_blank" rel="noopener noreferrer"
                        className="text-[var(--brand)] hover:underline truncate">↗ {emp.website}</a>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <EmployerApprovalButton employerId={emp.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved */}
      <section>
        <h2 className="text-[15px] font-bold mb-4">Approved employers <span className="text-[var(--muted)] font-normal">({approved.length})</span></h2>
        {approved.length === 0 ? (
          <p className="text-[13px] text-[var(--muted)]">No approved employers yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden sm:table-cell">Industry</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--subtle)] uppercase tracking-wider hidden md:table-cell">Approved</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {approved.map((emp, i) => (
                  <tr key={emp.id}
                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg)] transition-colors ${i % 2 !== 0 ? 'bg-[#FAFBFC]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--green-light)] flex items-center justify-center flex-shrink-0">
                          <Building2 size={13} className="text-[var(--green)]" />
                        </div>
                        <span className="font-semibold">{emp.company_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--muted)] hidden sm:table-cell">{emp.industry ?? '—'}</td>
                    <td className="px-5 py-3.5 text-[12px] text-[var(--muted)] hidden md:table-cell">
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
  )
}
