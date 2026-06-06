import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MarkAllReadButton } from './_actions'
import type { NotificationType } from '@/lib/types/database.types'
import { Bell } from 'lucide-react'

const TYPE_COLOR: Partial<Record<NotificationType, { bg: string; color: string }>> = {
  letter_approved:         { bg: 'var(--green-light)',  color: 'var(--green)'  },
  letter_rejected:         { bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  letter_under_review:     { bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  letter_collected:        { bg: 'var(--green-light)',  color: 'var(--green)'  },
  application_shortlisted: { bg: 'var(--green-light)',  color: 'var(--green)'  },
  application_hired:       { bg: 'var(--green-light)',  color: 'var(--green)'  },
  application_rejected:    { bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  application_reviewed:    { bg: 'var(--amber-light)',  color: 'var(--amber)'  },
  employer_approved:       { bg: 'var(--green-light)',  color: 'var(--green)'  },
  booking_confirmed:       { bg: 'var(--brand-light)',  color: 'var(--brand)'  },
  booking_cancelled:       { bg: 'var(--coral-light)',  color: 'var(--coral)'  },
  event_registered:        { bg: 'var(--purple-light)', color: 'var(--purple)' },
  general:                 { bg: '#F3F4F6',             color: 'var(--muted)'  },
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
          <div className="w-14 h-14 rounded-2xl bg-[var(--brand-light)] flex items-center justify-center mx-auto mb-4">
            <Bell size={24} className="text-[var(--brand)]" />
          </div>
          <p className="text-[14px] font-semibold mb-1">No notifications yet</p>
          <p className="text-[13px] text-[var(--muted)]">We'll let you know about letter updates, job decisions, and events.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const style = TYPE_COLOR[n.type as NotificationType] ?? { bg: '#F3F4F6', color: 'var(--muted)' }
            return (
              <div key={n.id}
                className={`bg-white rounded-2xl border p-4 flex gap-3.5 transition-all ${
                  n.is_read
                    ? 'border-[var(--border)]'
                    : 'border-[var(--brand-mid)] shadow-[var(--shadow-sm)]'
                }`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[15px]"
                  style={{ background: style.bg }}>
                  {notifIcon(n.type as NotificationType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className={`text-[13px] ${n.is_read ? 'text-[var(--text-2)]' : 'font-semibold text-[var(--text)]'}`}>
                      {n.title}
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[var(--brand)] flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  {n.body && <p className="text-[12px] text-[var(--muted)] mt-0.5 leading-relaxed">{n.body}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[11px] text-[var(--subtle)]">
                      {new Date(n.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {n.link && (
                      <Link href={n.link} className="text-[12px] text-[var(--brand)] font-semibold hover:underline">
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function notifIcon(type: NotificationType) {
  const map: Partial<Record<NotificationType, string>> = {
    letter_approved: '✅', letter_rejected: '❌', letter_under_review: '🔍',
    letter_collected: '📬', application_shortlisted: '🌟', application_hired: '🎉',
    application_rejected: '❌', application_reviewed: '👀', employer_approved: '✅',
    booking_confirmed: '🗓', booking_cancelled: '🚫', event_registered: '🎟', general: '📢',
  }
  return map[type] ?? '📢'
}
