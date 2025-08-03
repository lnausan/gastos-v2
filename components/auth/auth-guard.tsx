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

  // Verificar si Firebase está configurado
  const isFirebaseEnabled = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )

  // console.log('AuthGuard renderizando:', {
  //   loading,
  //   user: user ? 'Usuario presente' : 'Sin usuario',
  //   isFirebaseEnabled,
  //   pathname
  // })

  useEffect(() => {
    // console.log('AuthGuard useEffect ejecutándose:', {
    //   loading,
    //   user: user ? 'Usuario presente' : 'Sin usuario',
    //   isFirebaseEnabled,
    //   pathname
    // })

    if (loading) {
      // console.log('AuthGuard: Aún cargando...')
      return
    }

    if (isFirebaseEnabled) {
      // console.log('AuthGuard: Modo Firebase')
      if (pathname === '/auth') {
        if (user) {
          // console.log('AuthGuard: Usuario autenticado, redirigiendo a /')
          router.push('/')
        } else {
          // console.log('AuthGuard: Sin usuario, permitiendo acceso a /auth')
          setIsAuthorized(true)
        }
      } else {
        if (user) {
          // console.log('AuthGuard: Usuario autenticado, permitiendo acceso')
          setIsAuthorized(true)
        } else {
          // console.log('AuthGuard: Sin usuario, redirigiendo a /auth')
          router.push('/auth')
        }
      }
    } else {
      // console.log('AuthGuard: Modo local, permitiendo acceso')
      if (pathname === '/auth') {
        router.push('/')
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, loading, pathname, router, isFirebaseEnabled])

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está autorizado, no mostrar contenido
  if (!isAuthorized) {
    // console.log('AuthGuard: No autorizado, no mostrando contenido')
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-4 text-lg">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // console.log('AuthGuard: Autorizado, mostrando contenido')
  return <>{children}</>
} 