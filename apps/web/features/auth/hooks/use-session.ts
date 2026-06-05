'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { UserRole } from '@/lib/types/database.types'

interface SessionState {
  user: User | null
  role: UserRole | null
  loading: boolean
}

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    user: null,
    role: null,
    loading: true,
  })

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setState({
        user: data.user,
        role: (data.user?.app_metadata?.role as UserRole) ?? null,
        loading: false,
      })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setState({
        user: session?.user ?? null,
        role: (session?.user?.app_metadata?.role as UserRole) ?? null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  return state
}
