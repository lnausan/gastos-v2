"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Rutas que requieren autenticación
  const protectedRoutes = ['/', '/historial']
  const isProtectedRoute = protectedRoutes.includes(pathname)

  useEffect(() => {
    if (!loading) {
      if (isProtectedRoute && !user) {
        // Si es una ruta protegida y no hay usuario, redirigir a auth
        router.push('/auth')
      } else if (pathname === '/auth' && user) {
        // Si está en auth y ya está autenticado, redirigir al dashboard
        router.push('/')
      } else {
        // Usuario autorizado o ruta pública
        setIsAuthorized(true)
      }
    }
  }, [user, loading, pathname, isProtectedRoute, router])

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autorizado, no mostrar contenido
  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
} 