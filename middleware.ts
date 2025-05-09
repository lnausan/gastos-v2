import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("SESSION:", session)

  // Si el usuario no está autenticado y no está en la página de auth, redirigir a auth
  if (!session && !req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Si el usuario está autenticado y está en la página de auth, redirigir a home
  if (session && req.nextUrl.pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 