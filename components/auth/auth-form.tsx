'use client'

import { useState } from 'react'
import { useSupabase } from '@/components/providers/supabase-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return

    setIsLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              email_confirmed: true
            }
          },
        })
        if (error) throw error
        toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        toast.success('¡Inicio de sesión exitoso!')
        router.push('/')
      }
    } catch (error) {
      console.error('Error de autenticación:', error)
      toast.error(isSignUp ? 'Error al registrarse' : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-card rounded-lg shadow-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">
          {isSignUp ? 'Crear una cuenta' : 'Iniciar sesión'}
        </h1>
        <p className="text-muted-foreground">
          {isSignUp
            ? 'Ingresa tus datos para crear una cuenta'
            : 'Ingresa tus credenciales para acceder'}
        </p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading
            ? 'Cargando...'
            : isSignUp
            ? 'Registrarse'
            : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm"
        >
          {isSignUp
            ? '¿Ya tienes una cuenta? Inicia sesión'
            : '¿No tienes una cuenta? Regístrate'}
        </Button>
      </div>
    </div>
  )
} 