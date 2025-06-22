import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Para Firebase Auth, la autenticación se maneja en el cliente
  // El AuthGuard se encarga de la protección de rutas
  // Este middleware solo maneja redirecciones básicas si es necesario
  
  const { pathname } = request.nextUrl
  
  // Si el usuario accede directamente a /auth y ya está autenticado,
  // el AuthGuard se encargará de redirigirlo al dashboard
  
  return NextResponse.next()
}

// Configurar las rutas que deben ser manejadas por el middleware
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 