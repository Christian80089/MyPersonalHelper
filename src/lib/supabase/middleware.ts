import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/') &&  // ✅ Usa /auth (tuo prefisso)
    !request.nextUrl.pathname.startsWith('/signin') 
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'  // ✅ O /auth/login se page.tsx lì
    return NextResponse.redirect(url)
  }

  // ✅ NUOVO: Check admin per /protected/(admin)/*
  if (user && request.nextUrl.pathname.startsWith('/protected/(admin)')) {
    const claims = data.claims as any;  // Tipa se serve
    if (!claims.role?.includes('admin')) {  // Custom claim role
      const url = request.nextUrl.clone()
      url.pathname = '/protected/dashboard'  // Fallback non-admin
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
