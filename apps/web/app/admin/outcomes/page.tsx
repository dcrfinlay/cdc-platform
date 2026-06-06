import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'

export default async function OutcomesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()

  // ── Raw data pulls ───────────────────────────────────────────
  const [
    { data: applications },
    { data: employers },
    { count: totalStudents },
  ] = await Promise.all([
    admin
      .from('applications')
      .select('id, status, created_at, job_id, jobs(type, employer_id, employers(industry))'),
    admin
      .from('employers')
      .select('id, company_name, industry'),
    admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'student'),
  ])

  const apps = applications ?? []

  // ── KPIs ────────────────────────────────────────────────────
  const totalApps       = apps.length
  const hired           = apps.filter(a => a.status === 'hired')
  const totalHired      = hired.length
  const uniqueApplicants = new Set(apps.map(a => (a as any).student_id)).size
  const placementRate   = totalStudents
    ? Math.round((totalHired / (totalStudents as number)) * 100)
    : 0

  // ── Funnel ──────────────────────────────────────────────────
  const STATUSES = ['submitted', 'reviewed', 'shortlisted', 'rejected', 'hired'] as const
  const funnel = STATUSES.map(s => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    count: apps.filter(a => a.status === s).length,
  }))
  const funnelMax = Math.max(...funnel.map(f => f.count), 1)

  // ── Hires by type ───────────────────────────────────────────
  const hiresByType = {
    job:        hired.filter(a => (a as any).jobs?.type === 'job').length,
    internship: hired.filter(a => (a as any).jobs?.type === 'internship').length,
  }

  // ── Hires by industry ───────────────────────────────────────
  const industryMap: Record<string, number> = {}
  for (const a of hired) {
    const industry = (a as any).jobs?.employers?.industry ?? 'Unknown'
    industryMap[industry] = (industryMap[industry] ?? 0) + 1
  }
  const byIndustry = Object.entries(industryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
  const industryMax = Math.max(...byIndustry.map(([, v]) => v), 1)

  // ── Monthly applications (last 6 months) ────────────────────
  const months: { label: string; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    const label = d.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
    const count = apps.filter(a => {
      const ad = new Date(a.created_at)
      return ad.getFullYear() === y && ad.getMonth() + 1 === m
    }).length
    months.push({ label, count })
  }
  const monthMax = Math.max(...months.map(m => m.count), 1)

  // ── Top hiring employers ─────────────────────────────────────
  const empMap: Record<string, { name: string; count: number }> = {}
  for (const a of hired) {
    const empId   = (a as any).jobs?.employer_id
    const empData = employers?.find(e => e.id === empId)
    if (!empId) continue
    if (!empMap[empId]) empMap[empId] = { name: empData?.company_name ?? 'Unknown', count: 0 }
    empMap[empId].count++
  }
  const topEmployers = Object.values(empMap).sort((a, b) => b.count - a.count).slice(0, 5)

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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/admin/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Graduate outcomes</span>
        </div>

        <h1 className="text-[22px] font-bold mb-2">Graduate outcomes</h1>
        <p className="text-[13px] text-[#666] mb-8">Placement and application stats across all cohorts.</p>

        {/* KPI row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total students',    value: totalStudents ?? 0,  color: '#185FA5' },
            { label: 'Total applications',value: totalApps,           color: '#534AB7' },
            { label: 'Placed (hired)',     value: totalHired,          color: '#0F6E56' },
            { label: 'Placement rate',     value: `${placementRate}%`, color: placementRate >= 50 ? '#0F6E56' : '#854F0B' },
          ].map(k => (
            <div key={k.label} className="bg-white border border-[#e5e4df] rounded-xl p-4">
              <div className="text-[24px] font-bold" style={{ color: k.color }}>{k.value}</div>
              <div className="text-[11px] text-[#888] mt-1">{k.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Application funnel */}
          <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
            <h2 className="text-[14px] font-bold mb-4">Application funnel</h2>
            <div className="space-y-3">
              {funnel.map(f => (
                <div key={f.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#444]">{f.label}</span>
                    <span className="text-[12px] font-bold text-[#1a1a18]">{f.count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f0efe9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#185FA5]"
                      style={{ width: `${Math.round((f.count / funnelMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly applications */}
          <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
            <h2 className="text-[14px] font-bold mb-4">Applications — last 6 months</h2>
            <div className="flex items-end gap-2 h-32">
              {months.map(m => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-[#888]">{m.count || ''}</span>
                  <div className="w-full rounded-t-md bg-[#E6F1FB]" style={{
                    height: `${Math.round((m.count / monthMax) * 100)}%`,
                    minHeight: m.count > 0 ? '4px' : '0',
                    background: '#185FA5',
                    opacity: 0.7 + (m.count / monthMax) * 0.3,
                  }} />
                  <span className="text-[10px] text-[#888]">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Hires by type */}
          <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
            <h2 className="text-[14px] font-bold mb-4">Hires by type</h2>
            <div className="space-y-3">
              {[
                { label: 'Full-time job',  count: hiresByType.job,        color: '#185FA5', bg: '#E6F1FB' },
                { label: 'Internship',     count: hiresByType.internship,  color: '#0F6E56', bg: '#E1F5EE' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between px-4 py-3 rounded-lg" style={{ background: r.bg }}>
                  <span className="text-[13px] font-semibold" style={{ color: r.color }}>{r.label}</span>
                  <span className="text-[20px] font-bold" style={{ color: r.color }}>{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top employers */}
          <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
            <h2 className="text-[14px] font-bold mb-4">Top hiring employers</h2>
            {topEmployers.length === 0 ? (
              <p className="text-[13px] text-[#888]">No hires recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {topEmployers.map((e, i) => (
                  <div key={e.name} className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-[#aaa] w-4">{i + 1}</span>
                    <span className="flex-1 text-[13px] text-[#1a1a18] truncate">{e.name}</span>
                    <span className="text-[12px] font-bold text-[#0F6E56]">{e.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hires by industry */}
        {byIndustry.length > 0 && (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-6">
            <h2 className="text-[14px] font-bold mb-4">Hires by industry</h2>
            <div className="space-y-3">
              {byIndustry.map(([industry, count]) => (
                <div key={industry}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] text-[#444]">{industry}</span>
                    <span className="text-[12px] font-bold text-[#1a1a18]">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#f0efe9] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#0F6E56]"
                      style={{ width: `${Math.round((count / industryMax) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
