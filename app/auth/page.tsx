"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, LogIn } from "lucide-react"

export default function AuthPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    // Simular un pequeño delay para mostrar el loading
    await new Promise(resolve => setTimeout(resolve, 1000))
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¿Cuánto gasto?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Gestiona tus finanzas personales de manera simple
          </p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Bienvenido</CardTitle>
            <CardDescription>
              Inicia sesión para comenzar a gestionar tus finanzas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleDemoLogin} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión (Demo)
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Modo demo - No se requieren credenciales reales
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 