'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export function NotificationBell({ userId }: { userId: string }) {
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const supabase = createClient()

    // Initial count
    supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false)
      .then(({ count }) => setUnread(count ?? 0))

    // Realtime subscription — new notification arrives → increment badge
    const channel = supabase
      .channel('notifications-bell')
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => setUnread(n => n + 1)
      )
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${userId}`,
        },
        // Re-fetch count on any update (mark-read)
        () => {
          supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false)
            .then(({ count }) => setUnread(count ?? 0))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return (
    <Link
      href="/student/notifications"
      className="relative flex items-center justify-center w-8 h-8 rounded-lg
        hover:bg-[#f0efe9] transition-colors"
      title="Notifications"
    >
      <span className="text-[16px]">🔔</span>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full
          bg-[#185FA5] text-white text-[9px] font-bold flex items-center justify-center">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  )
}
