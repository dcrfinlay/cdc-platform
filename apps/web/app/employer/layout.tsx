import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { href: '/employer/dashboard',     label: 'Dashboard'      },
  { href: '/employer/jobs',          label: 'Job postings'   },
  { href: '/employer/resumes',       label: 'Student CVs'    },
  { href: '/employer/notifications', label: 'Notifications'  },
  { href: '/employer/profile',       label: 'Company profile'},
]

export default async function EmployerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: employer } = await supabase
    .from('employers')
    .select('company_name')
    .eq('id', user.id)
    .single()

  const { count: unread } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const navWithBadge = NAV.map(item =>
    item.href === '/employer/notifications'
      ? { ...item, badge: unread ?? 0 }
      : item
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        items={navWithBadge}
        userName={employer?.company_name ?? ''}
        userEmail={user.email ?? ''}
        role="employer"
      />
      <main className="lg:pl-[var(--sidebar-w)] pt-[57px] lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
