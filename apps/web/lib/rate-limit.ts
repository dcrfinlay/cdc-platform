import { headers } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Check a rate limit bucket.
 * Returns { allowed: true } or { allowed: false, retryAfter: number (seconds) }
 *
 * Limits:
 *  signin          — 5 attempts per 15 min
 *  signup          — 3 attempts per 60 min
 *  forgot-password — 3 attempts per 60 min
 */
type Bucket = 'signin' | 'signup' | 'forgot-password'

const LIMITS: Record<Bucket, { max: number; windowSecs: number }> = {
  'signin':          { max: 5,  windowSecs: 15 * 60 },
  'signup':          { max: 3,  windowSecs: 60 * 60 },
  'forgot-password': { max: 3,  windowSecs: 60 * 60 },
}

export async function checkRateLimit(
  bucket: Bucket
): Promise<{ allowed: boolean; retryAfter?: number }> {
  const hdrs = await headers()
  const ip =
    hdrs.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    hdrs.get('x-real-ip') ??
    'unknown'

  const { max, windowSecs } = LIMITS[bucket]
  const key = `${bucket}:${ip}`

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('check_rate_limit', {
      p_key: key,
      p_max: max,
      p_window_secs: windowSecs,
    })

    if (error) {
      // Fail open — never block on a DB error
      console.error('[rate-limit] RPC error:', error.message)
      return { allowed: true }
    }

    if (!data) {
      return { allowed: false, retryAfter: windowSecs }
    }

    return { allowed: true }
  } catch (err) {
    // Fail open
    console.error('[rate-limit] unexpected error:', err)
    return { allowed: true }
  }
}
