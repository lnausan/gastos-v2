'use client'

import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { User } from '@supabase/supabase-js'

export default function UserProfile() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
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

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-card">
      <div className="flex-1">
        <p className="text-sm font-medium">{user.email}</p>
        <p className="text-xs text-muted-foreground">Usuario activo</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSignOut}
      >
        Cerrar sesión
      </Button>
    </div>
  )
} 