import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { href: '/admin/dashboard',     label: 'Dashboard'         },
  { href: '/admin/employers',     label: 'Employers'         },
  { href: '/admin/users',         label: 'Users'             },
  { href: '/admin/announcements', label: 'Announcements'     },
  { href: '/admin/outcomes',      label: 'Graduate outcomes' },
  { href: '/admin/audit-log',     label: 'Audit log'         },
  { href: '/staff/letters',       label: 'Letters'           },
  { href: '/staff/events',        label: 'Events'            },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
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
        role="admin"
      />
      <main className="lg:pl-[var(--sidebar-w)] pt-[57px] lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
