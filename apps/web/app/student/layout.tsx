import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/sidebar'

const NAV = [
  { href: '/student/dashboard',           label: 'Dashboard'         },
  { href: '/student/jobs',                label: 'Jobs & Internships' },
  { href: '/student/jobs/my-applications',label: 'My applications'   },
  { href: '/student/jobs/saved',          label: 'Saved jobs'        },
  { href: '/student/events',              label: 'Events'            },
  { href: '/student/letters',             label: 'Internship letters' },
  { href: '/student/appointments',        label: 'Appointments'      },
  { href: '/student/resume',              label: 'My CV'             },
  { href: '/student/notifications',       label: 'Notifications'     },
  { href: '/student/profile',             label: 'Profile'           },
]

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Unread notifications badge
  const { count: unread } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)

  const navWithBadge = NAV.map(item =>
    item.href === '/student/notifications'
      ? { ...item, badge: unread ?? 0 }
      : item
  )

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar
        items={navWithBadge}
        userName={profile?.full_name ?? ''}
        userEmail={user.email ?? ''}
        role="student"
      />
      {/* Content offset for sidebar */}
      <main className="lg:pl-[var(--sidebar-w)] pt-[57px] lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
