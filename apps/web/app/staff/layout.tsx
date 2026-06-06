import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { href: '/staff/dashboard',    label: 'Dashboard'          },
  { href: '/staff/letters',      label: 'Internship letters' },
  { href: '/staff/events',       label: 'Events'             },
  { href: '/staff/appointments', label: 'Appointments'       },
  { href: '/staff/profile',      label: 'My profile'         },
]

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        items={NAV}
        userName={profile?.full_name ?? ''}
        userEmail={user.email ?? ''}
        role="staff"
      />
      <main className="lg:pl-[var(--sidebar-w)] pt-[57px] lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
