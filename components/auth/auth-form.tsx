"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password)

      if (result.success) {
        toast(isSignUp ? "Cuenta creada exitosamente" : "Inicio de sesión exitoso")
        setTimeout(() => {
          router.push('/')
        }, 1000)
      } else {
        toast(result.error || "Error en la autenticación")
      }
    } catch (error) {
      toast("Error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-white">
          {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
        </h3>
        <p className="text-sm text-white/70 mt-1">
          {isSignUp 
            ? "Crea una nueva cuenta para comenzar a gestionar tus gastos"
            : "Ingresa tus credenciales para acceder a tu cuenta"
          }
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50"
          />
        </div>
        <Button 
          type="submit" 
          className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-white/50" 
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : (isSignUp ? "Crear cuenta" : "Iniciar sesión")}
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-white/80 hover:text-white"
        >
          {isSignUp 
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Crea una"
          }
        </Button>
      </div>
    </div>
  )
} 