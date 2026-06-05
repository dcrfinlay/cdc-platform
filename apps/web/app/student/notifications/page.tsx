import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NavLogo } from '@/components/nav-logo'
import { signOut } from '@/features/auth/actions/sign-out'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { MarkAllReadButton } from './_actions'
import type { NotificationType } from '@/lib/types/database.types'

const TYPE_ICON: Partial<Record<NotificationType, string>> = {
  letter_approved:         '✅',
  letter_rejected:         '❌',
  letter_under_review:     '🔍',
  letter_collected:        '📬',
  application_shortlisted: '🌟',
  application_hired:       '🎉',
  application_rejected:    '❌',
  application_reviewed:    '👀',
  employer_approved:       '✅',
  booking_confirmed:       '🗓',
  booking_cancelled:       '🚫',
  event_registered:        '🎟',
  general:                 '📢',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, type, title, body, link, is_read, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div className="min-h-screen" style={{ background: 'var(--surface)' }}>
      <nav className="bg-white border-b border-[#e5e4df] px-7 py-3 flex items-center justify-between">
        <NavLogo />
        <div className="flex items-center gap-3">
          <NotificationBell userId={user.id} />
          <span className="text-[12.5px] text-[#666]">{profile?.full_name ?? user.email}</span>
          <form action={signOut}>
            <button type="submit" className="text-[12px] text-[#185FA5] hover:underline">Sign out</button>
          </form>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 text-[12.5px] text-[#888] mb-6">
          <Link href="/student/dashboard" className="hover:text-[#185FA5]">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1a18]">Notifications</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-[22px] font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-[12px] text-[#888] mt-1">{unreadCount} unread</p>
            )}
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
                className={`bg-white border rounded-xl p-4 flex gap-3 transition-colors ${
                  n.is_read ? 'border-[#e5e4df]' : 'border-[#185FA5] border-opacity-40 bg-[#fafcff]'
                }`}>
                <div className="w-8 h-8 rounded-lg bg-[#f0efe9] flex items-center justify-center text-base flex-shrink-0">
                  {TYPE_ICON[n.type as NotificationType] ?? '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-[13px] ${n.is_read ? 'text-[#444]' : 'font-semibold text-[#1a1a18]'}`}>
                      {n.title}
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[#185FA5] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  {n.body && <p className="text-[12px] text-[#666] mt-0.5 leading-relaxed">{n.body}</p>}
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[11px] text-[#aaa]">
                      {new Date(n.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-[11px] text-[#185FA5] font-semibold hover:underline">
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
