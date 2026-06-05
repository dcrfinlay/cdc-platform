import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database.types'

// Service role client — bypasses RLS.
// ONLY import in Server Actions or Route Handlers. Never expose to client.
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
