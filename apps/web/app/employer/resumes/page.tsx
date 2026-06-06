import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'

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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/employer/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5] hidden sm:block">
            {employer.company_name}
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/employer/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Student CVs</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Student CVs</h1>
            <p className="text-[13px] text-[#666] mt-1">
              {results.length} student{results.length !== 1 ? 's' : ''} with visible CV
            </p>
          </div>
        </div>

        {/* Filters */}
        <form method="GET" className="bg-white border border-[#e5e4df] rounded-xl p-5 mb-6">
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
                className="px-4 py-2 rounded-lg text-[13px] text-[#666] border border-[#e5e4df] bg-white hover:border-[#aaa]"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Results */}
        {results.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-12 text-center">
            <p className="text-[13px] text-[#888]">No students match your filters.</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e5e4df] rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e5e4df] bg-[#fafaf8]">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden sm:table-cell">Degree</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden md:table-cell">Skills</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider hidden lg:table-cell">Graduation</th>
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-[#888] uppercase tracking-wider">CV</th>
                </tr>
              </thead>
              <tbody>
                {results.map((s, i) => (
                  <tr
                    key={s.id}
                    className={`border-b border-[#e5e4df] last:border-0 ${i % 2 !== 0 ? 'bg-[#fdfdfb]' : ''}`}
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-[#1a1a18]">{s.full_name ?? '—'}</div>
                      {s.faculty && (
                        <div className="text-[11px] text-[#888] mt-0.5">{s.faculty}</div>
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
                            <span className="text-[10px] text-[#888]">+{s.skills.length - 4}</span>
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
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-4">
          <Link href="/employer/dashboard" className="text-[12.5px] text-[#666] hover:text-[#185FA5] hidden sm:block">
            {employer}
          </Link>
        </div>
      </nav>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/employer/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Student CVs</span>
        </div>
        <h1 className="text-[22px] font-bold mb-6">Student CVs</h1>
        <form method="GET" className="bg-white border border-[#e5e4df] rounded-xl p-5 mb-6">
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
        <div className="bg-white border border-[#e5e4df] rounded-xl p-12 text-center">
          <p className="text-[13px] text-[#888]">No students have made their CV visible yet.</p>
        </div>
      </div>
    </div>
  )
}
