'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Wallet } from 'lucide-react'

export default function Header() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error al obtener la sesión:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      toast.success('Sesión cerrada correctamente')
      setTimeout(() => {
        router.refresh()
        router.push('/auth')
      }, 100)
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (isLoading) {
    return null
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300 opacity-80" />
          <h1 className="text-xl font-bold">¿Cuánto gasto?</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-sm font-medium">
              Dashboard
            </Button>
          </Link>
          <Link href="/historial">
            <Button variant="ghost" className="text-sm font-medium">
              Historial
            </Button>
          </Link>
          <ThemeSwitcher />
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => router.push('/auth')}
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>
    </header>
  )
} 