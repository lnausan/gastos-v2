import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Si el usuario está autenticado y está en /auth, redirigir a /
    if (session && request.nextUrl.pathname === '/auth') {
      console.log('Usuario autenticado en /auth, redirigiendo a /')
      return NextResponse.redirect(new URL('/', request.url))
    }

    // Si el usuario no está autenticado y no está en /auth, redirigir a /auth
    if (!session && request.nextUrl.pathname !== '/auth') {
      console.log('Usuario no autenticado, redirigiendo a /auth')
      return NextResponse.redirect(new URL('/auth', request.url))
    }

    return res
  } catch (error) {
    console.error('Error en middleware:', error)
    // En caso de error, redirigir a /auth
    return NextResponse.redirect(new URL('/auth', request.url))
  }
}

// Configurar las rutas que deben pasar por el middleware
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 