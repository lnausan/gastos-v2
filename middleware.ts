import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Obtener el token de Firebase desde las cookies
  const token = request.cookies.get('firebase-token')?.value
  
  // Rutas que requieren autenticación
  const protectedRoutes = ['/', '/historial']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route
  )
  
  // Ruta de autenticación
  const isAuthRoute = request.nextUrl.pathname === '/auth'
  
  // Si es una ruta protegida y no hay token, redirigir a auth
  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }
  
  // Si es la ruta de auth y hay token, redirigir al dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 