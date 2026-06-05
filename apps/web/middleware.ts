import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types/database.types'
import { getRoleDashboard } from '@/lib/utils'

// Routes accessible without a session
const PUBLIC_PATHS = ['/home', '/login', '/signup', '/magic-link', '/forgot-password', '/reset-password', '/auth']

// Prefix → roles that may access it
const ROLE_PREFIXES: Array<{ prefix: string; roles: string[] }> = [
  { prefix: '/student', roles: ['student'] },
  { prefix: '/employer', roles: ['employer'] },
  { prefix: '/staff', roles: ['staff', 'admin'] },
  { prefix: '/admin', roles: ['admin'] },
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Always refresh session — required by @supabase/ssr
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // Unauthenticated user hitting a protected route
  if (!user && !isPublic && pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting an auth page → send to their dashboard
  if (user && ['/login', '/signup', '/magic-link', '/forgot-password'].some(p => pathname.startsWith(p))) {
    const role = (user.app_metadata?.role as string) ?? 'student'
    return NextResponse.redirect(new URL(getRoleDashboard(role), request.url))
  }

  // Role gate — wrong role hits a role-prefixed route
  if (user) {
    const role = (user.app_metadata?.role as string) ?? 'student'
    for (const { prefix, roles } of ROLE_PREFIXES) {
      if (pathname.startsWith(prefix) && !roles.includes(role)) {
        return NextResponse.redirect(new URL(getRoleDashboard(role), request.url))
      }
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
