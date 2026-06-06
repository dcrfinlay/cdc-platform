import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

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
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Audit log</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">{count ?? 0} total entries</p>
      </div>

        <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden shadow-[var(--shadow-sm)]">
          {!logs || logs.length === 0 ? (
            <div className="p-10 text-center text-[13px] text-[var(--muted)]">No audit entries yet.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Action</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider hidden md:table-cell">Actor</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider hidden sm:table-cell">Details</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id}
                    className={`border-b border-[var(--border)] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-[var(--text)]">
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[#666] hidden md:table-cell">
                      {log.actor_email ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-[11px] text-[var(--muted)] hidden sm:table-cell">
                      {log.target_table && <span className="mr-2 font-mono">{log.target_table}</span>}
                      {log.metadata && Object.entries(log.metadata as Record<string, unknown>).map(([k, v]) => (
                        <span key={k} className="mr-2">{k}: <strong>{String(v)}</strong></span>
                      ))}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-[var(--muted)] whitespace-nowrap">
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

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            {page > 1 && (
              <Link href={`/admin/audit-log?page=${page - 1}`}
                className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)]">
                ← Previous
              </Link>
            )}
            <span className="text-[12.5px] text-[var(--muted)]">Page {page} of {totalPages}</span>
            {page < totalPages && (
              <Link href={`/admin/audit-log?page=${page + 1}`}
                className="px-4 py-2 rounded-xl text-[12.5px] font-semibold border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--border-strong)]">
                Next →
              </Link>
            )}
          </div>
        )}
    </div>
  )
}
