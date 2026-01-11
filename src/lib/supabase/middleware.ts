// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE = /\.(.*)$/;

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ non proteggere file statici + manifest
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/manifest.webmanifest" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ✅ FIX: getSession() invece di getClaims()
  const { data: { session } } = await supabase.auth.getSession()
  
  // ✅ PROTEZIONE CORRETTA
  if (!session && !request.nextUrl.pathname.startsWith('/signin')) {
    const loginUrl = new URL('/signin', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return supabaseResponse
}
