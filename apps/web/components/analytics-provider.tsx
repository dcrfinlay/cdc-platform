'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Lightweight PostHog integration — no npm package needed for basic analytics.
// Uses the PostHog JS snippet loaded via script tag in layout.tsx.
// Full SDK: npm install posthog-js, then replace with usePostHog() hook.
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, props?: Record<string, unknown>) => void
      identify: (id: string, props?: Record<string, unknown>) => void
      reset: () => void
    }
  }
}

interface AnalyticsProviderProps {
  userId?: string
  userRole?: string
}

export function AnalyticsProvider({ userId, userRole }: AnalyticsProviderProps) {
  const pathname = usePathname()

  // Identify user on mount
  useEffect(() => {
    if (userId && window.posthog) {
      window.posthog.identify(userId, { role: userRole })
    }
  }, [userId, userRole])

  // Track page views
  useEffect(() => {
    window.posthog?.capture('$pageview', { path: pathname })
  }, [pathname])

  return null
}
