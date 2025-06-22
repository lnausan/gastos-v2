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
    <div className="w-full space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">
          {isSignUp ? "Crear cuenta" : "Iniciar sesión"}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          {isSignUp 
            ? "Crea una nueva cuenta para comenzar a gestionar tus gastos"
            : "Ingresa tus credenciales para acceder a tu cuenta"
          }
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password" className="font-medium">Contraseña</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? "Cargando..." : (isSignUp ? "Crear cuenta" : "Iniciar sesión")}
        </Button>
      </form>
      
      <div className="text-center">
        <Button
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm"
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