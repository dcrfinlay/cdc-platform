import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'

const ACTION_LABELS: Record<string, string> = {
  'employer.approved':  'Employer approved',
  'employer.rejected':  'Employer access revoked',
  'user.role_changed':  'User role changed',
}

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

const PAGE_SIZE = 50

export default async function AuditLogPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { page: pageStr = '1' } = await searchParams
  const page   = Math.max(1, parseInt(pageStr, 10))
  const from   = (page - 1) * PAGE_SIZE
  const to     = from + PAGE_SIZE - 1

  const admin = createAdminClient()
  const { data: logs, count } = await admin
    .from('audit_logs')
    .select('id, action, actor_email, target_table, target_id, metadata, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5]">Dashboard</Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/admin/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Audit log</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Audit log</h1>
            <p className="text-[13px] text-[#666] mt-1">{count ?? 0} total entries</p>
          </div>
        </div>

        <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
          {!logs || logs.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-[#888]">No audit entries yet.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Actor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Details</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id}
                    className={`border-b border-[#e5e4df] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[#1a1a18]">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#666] hidden md:table-cell">
                      {log.actor_email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-[#888] hidden sm:table-cell">
                      {log.target_table && <span className="mr-2 font-mono">{log.target_table}</span>}
                      {log.metadata && Object.entries(log.metadata as Record<string, unknown>).map(([k, v]) => (
                        <span key={k} className="mr-2">{k}: <strong>{String(v)}</strong></span>
                      ))}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#888] whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/audit-log?page=${page - 1}`}
                className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e5e4df] bg-white text-[#666] hover:border-[#aaa]">
                ← Previous
              </Link>
            )}
            <span className="text-[12.5px] text-[#888]">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/admin/audit-log?page=${page + 1}`}
                className="px-4 py-2 rounded-lg text-[12.5px] font-semibold border border-[#e5e4df] bg-white text-[#666] hover:border-[#aaa]">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
