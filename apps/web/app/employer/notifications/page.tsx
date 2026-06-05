import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { markAllNotificationsRead } from '@/features/notifications/actions/mark-read'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { MarkAllReadButton } from './_actions'

export default async function EmployerNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: notifications }, { data: employer }] = await Promise.all([
    supabase.from('notifications').select('id, type, title, body, link, is_read, created_at')
      .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50),
    supabase.from('employers').select('company_name').eq('id', user.id).single(),
  ])

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-3">
          <NotificationBell userId={user.id} />
          <span className="text-[12.5px] text-[#666]">{employer?.company_name}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Notifications</h1>
            {unreadCount > 0 && <p className="text-[12px] text-[#888] mt-1">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && <MarkAllReadButton />}
        </div>

        {!notifications || notifications.length === 0 ? (
          <div className="bg-white border border-[#e5e4df] rounded-xl p-10 text-center">
            <p className="text-[13px] text-[#888]">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id}
                className={`bg-white border rounded-xl p-4 flex gap-3 ${
                  n.is_read ? 'border-[#e5e4df]' : 'border-[#0F6E56] border-opacity-40 bg-[#fafffe]'
                }`}>
                <div className="w-8 h-8 rounded-lg bg-[#E1F5EE] flex items-center justify-center text-base flex-shrink-0">
                  📬
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-[13px] ${n.is_read ? 'text-[#444]' : 'font-semibold text-[#1a1a18]'}`}>
                    {n.title}
                  </div>
                  {n.body && <p className="text-[12px] text-[#666] mt-0.5">{n.body}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-[#aaa]">
                      {new Date(n.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-[11px] text-[#0F6E56] font-semibold hover:underline">
                        View →
                      </Link>
                    )}
                  </div>
                </div>
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-[#0F6E56] flex-shrink-0 mt-1" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
