import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MarkAllReadButton } from './_actions'
import { Bell } from 'lucide-react'

export default async function EmployerNotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: notifications } = await supabase
    .from('notifications').select('id, type, title, body, link, is_read, created_at')
    .eq('user_id', user.id).order('created_at', { ascending: false }).limit(50)

  const unreadCount = (notifications ?? []).filter(n => !n.is_read).length

  return (
    <div className="p-6 lg:p-10 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Notifications</h1>
          <p className="text-[13px] text-[var(--muted)] mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {!notifications || notifications.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] p-14 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--green-light)] flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-[var(--green)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No notifications yet</p>
          <p className="text-[13px] text-[var(--muted)]">Updates about applications and job postings appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id}
              className={`bg-white rounded-2xl border p-4 flex gap-3.5 transition-all ${
                n.is_read ? 'border-[var(--border)]' : 'border-[var(--brand-mid)] shadow-[var(--shadow-sm)]'
              }`}>
              <div className="w-9 h-9 rounded-xl bg-[var(--green-light)] flex items-center justify-center flex-shrink-0 text-base">
                📬
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] ${n.is_read ? 'text-[var(--text-2)]' : 'font-semibold text-[var(--text)]'}`}>
                  {n.title}
                </div>
                {n.body && <p className="text-[12px] text-[var(--muted)] mt-0.5">{n.body}</p>}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-[var(--subtle)]">
                    {new Date(n.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  {n.link && (
                    <Link href={n.link} className="text-[12px] text-[var(--brand)] font-semibold hover:underline">
                      View →
                    </Link>
                  )}
                </div>
              </div>
              {!n.is_read && <div className="w-2 h-2 rounded-full bg-[var(--brand)] flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
