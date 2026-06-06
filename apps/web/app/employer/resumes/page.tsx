import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface PageProps {
  searchParams: Promise<{
    q?: string
    graduation_year?: string
    degree?: string
    skill?: string
  }>
}

export default async function EmployerResumesPage({ searchParams }: PageProps) {
  // Auth: must be approved employer
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('approved, company_name')
    .eq('id', user.id)
    .single()

  if (!employer?.approved) redirect('/employer/dashboard')

  const { q = '', graduation_year = '', degree = '', skill = '' } = await searchParams

  // Join resumes + profiles using admin client (employer JWT can read
  // profiles via the policy added in 0009, but the join is cleaner here
  // and the auth check above already enforces employer access).
  const admin = createAdminClient()

  // Build the profiles query with filters
  let profilesQuery = admin
    .from('profiles')
    .select('id, full_name, faculty, year_of_study, graduation_year, degree, skills')
    .eq('role', 'student')

  if (q) {
    profilesQuery = profilesQuery.ilike('full_name', `%${q}%`)
  }
  if (graduation_year) {
    profilesQuery = profilesQuery.eq('graduation_year', parseInt(graduation_year, 10))
  }
  if (degree) {
    profilesQuery = profilesQuery.ilike('degree', `%${degree}%`)
  }
  if (skill) {
    profilesQuery = profilesQuery.contains('skills', [skill])
  }

  const { data: profiles } = await profilesQuery

  if (!profiles || profiles.length === 0) {
    return <EmptyLayout employer={employer.company_name} q={q} graduation_year={graduation_year} degree={degree} skill={skill} results={[]} />
  }

  // Fetch visible resumes for the returned student IDs
  const studentIds = profiles.map(p => p.id)
  const { data: resumes } = await admin
    .from('resumes')
    .select('student_id, file_name, file_size, uploaded_at')
    .in('student_id', studentIds)
    .eq('cv_visible', true)

  const resumeMap = Object.fromEntries((resumes ?? []).map(r => [r.student_id, r]))

  // Only keep students who actually have a visible CV
  const results = profiles
    .filter(p => resumeMap[p.id])
    .map(p => ({ ...p, resume: resumeMap[p.id] }))

  // Distinct graduation years for filter dropdown
  const { data: yearRows } = await admin
    .from('profiles')
    .select('graduation_year')
    .eq('role', 'student')
    .not('graduation_year', 'is', null)
    .order('graduation_year', { ascending: false })

  const years = [...new Set((yearRows ?? []).map(r => r.graduation_year).filter(Boolean))]

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold tracking-tight">Student CVs</h1>
        <p className="text-[13px] text-[var(--muted)] mt-1">
          {results.length} student{results.length !== 1 ? 's' : ''} with visible CV
        </p>
      </div>

        {/* Filters */}
        <form method="GET" className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-6 shadow-[var(--shadow-sm)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Search name</label>
              <input
                name="q"
                defaultValue={q}
                placeholder="e.g. John Smith"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Graduation year</label>
              <select
                name="graduation_year"
                defaultValue={graduation_year}
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5] bg-white"
              >
                <option value="">All years</option>
                {years.map(y => (
                  <option key={y} value={y!}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Degree / programme</label>
              <input
                name="degree"
                defaultValue={degree}
                placeholder="e.g. Business Administration"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Skill</label>
              <input
                name="skill"
                defaultValue={skill}
                placeholder="e.g. Python"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90"
            >
              Search
            </button>
            {(q || graduation_year || degree || skill) && (
              <Link
                href="/employer/resumes"
                className="px-4 py-2 rounded-lg text-[13px] text-[#666] border border-[var(--border)] bg-white hover:border-[#aaa]"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
            <p className="text-[13px] text-[var(--muted)]">No students match your filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider hidden sm:table-cell">Degree</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider hidden md:table-cell">Skills</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider hidden lg:table-cell">Graduation</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">CV</th>
                </tr>
              </thead>
              <tbody>
                {results.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-[var(--border)] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[var(--text)]">{s.full_name ?? '—'}</div>
                      {s.faculty && (
                        <div className="text-[11px] text-[var(--muted)] mt-0.5">{s.faculty}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#555] hidden sm:table-cell">
                      {s.degree ?? <span className="text-[#bbb]">—</span>}
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      {s.skills && s.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {s.skills.slice(0, 4).map((sk: string) => (
                            <span
                              key={sk}
                              className="px-2 py-0.5 rounded-full bg-[#E6F1FB] text-[#185FA5] text-[10px] font-semibold"
                            >
                              {sk}
                            </span>
                          ))}
                          {s.skills.length > 4 && (
                            <span className="text-[10px] text-[var(--muted)]">+{s.skills.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#bbb] text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[12px] text-[#555] hidden lg:table-cell">
                      {s.graduation_year ?? <span className="text-[#bbb]">—</span>}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`/api/resumes/download?studentId=${s.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                          bg-[#E1F5EE] text-[#0F6E56] hover:bg-[#c8eddf] transition-colors"
                      >
                        ↓ Download CV
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  )
}

// Extracted so TypeScript is happy when results=[]
function EmptyLayout({
  employer, q, graduation_year, degree, skill, results,
}: {
  employer: string
  q: string; graduation_year: string; degree: string; skill: string
  results: unknown[]
}) {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <h1 className="text-[24px] font-bold tracking-tight mb-6">Student CVs</h1>
        <form method="GET" className="bg-white rounded-2xl border border-[var(--border)] p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Search name</label>
              <input name="q" defaultValue={q} placeholder="e.g. John Smith"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Graduation year</label>
              <select name="graduation_year" defaultValue={graduation_year}
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5] bg-white">
                <option value="">All years</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Degree / programme</label>
              <input name="degree" defaultValue={degree} placeholder="e.g. Business Administration"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#444] mb-1.5">Skill</label>
              <input name="skill" defaultValue={skill} placeholder="e.g. Python"
                className="w-full px-3 py-2 text-[13px] border border-[#ccc] rounded-lg focus:outline-none focus:border-[#185FA5]" />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button type="submit"
              className="px-5 py-2 rounded-lg text-[13px] font-bold text-white bg-[#185FA5] hover:opacity-90">
              Search
            </button>
          </div>
        </form>
        <div className="bg-white rounded-2xl border border-[var(--border)] p-12 text-center">
          <p className="text-[13px] text-[var(--muted)]">No students have made their CV visible yet.</p>
        </div>
    </div>
  )
}
