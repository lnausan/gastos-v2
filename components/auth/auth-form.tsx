'use client'

import { useState, useEffect } from 'react'
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
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  useEffect(() => {
    if (cooldown && cooldownTime > 0) {
      const timer = setInterval(() => {
        setCooldownTime((prev) => {
          if (prev <= 1) {
            setCooldown(false)
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown, cooldownTime])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase || cooldown) return

    setIsLoading(true)
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        toast.success('¡Registro exitoso! Ya puedes iniciar sesión.')
        setIsSignUp(false)
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        if (data?.session) {
          setAttempts(0)
          toast.success('¡Inicio de sesión exitoso!')
          router.refresh()
          router.push('/')
        } else {
          throw new Error('No se pudo iniciar sesión')
        }
      }
    } catch (error: any) {
      console.error('Error de autenticación:', error)
      
      if (error.message?.includes('rate limit')) {
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        
        const waitTime = Math.min(60, Math.pow(2, newAttempts) * 5)
        setCooldownTime(waitTime)
        setCooldown(true)
        
        toast.error(`Demasiados intentos. Por favor, espera ${waitTime} segundos.`)
      } else if (error.message?.includes('Invalid login credentials')) {
        toast.error('Credenciales inválidas. Por favor, verifica tu email y contraseña.')
      } else if (error.message?.includes('Email not confirmed')) {
        toast.error('Por favor, confirma tu email antes de iniciar sesión.')
      } else if (error.message?.includes('Email rate limit exceeded')) {
        toast.error('Demasiados intentos de envío de email. Por favor, espera unos minutos.')
      } else {
        toast.error(isSignUp ? 'Error al registrarse' : 'Error al iniciar sesión')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
        </h2>
      </div>
      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || cooldown}
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
            disabled={isLoading || cooldown}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading || cooldown}
        >
          {isLoading ? 'Cargando...' : cooldown ? `Espera ${cooldownTime}s...` : isSignUp ? 'Registrarse' : 'Iniciar sesión'}
        </Button>
      </form>
      <div className="text-center">
        <button
          type="button"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-muted-foreground hover:underline"
          disabled={isLoading || cooldown}
        >
          {isSignUp
            ? '¿Ya tienes cuenta? Inicia sesión'
            : '¿No tienes cuenta? Regístrate'}
        </button>
      </div>
    </div>
  )
} 