'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Bell } from 'lucide-react'

export function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0))

    const channel = supabase
      .channel('notifications-bell')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => setUnread(n => n + 1))
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        supabase.from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId).eq('is_read', false)
          .then(({ count }) => setUnread(count ?? 0))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <Link href="/student/notifications"
      className="relative flex items-center justify-center w-8 h-8 rounded-xl
        hover:bg-white/10 transition-colors"
      title="Notifications">
      <Bell size={17} className="text-[var(--sidebar-text)]" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
          bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
