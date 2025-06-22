"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { Wallet } from "lucide-react"
import Aurora from "@/components/aurora"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo Aurora */}
      <Aurora 
        colorStops={["#1e40af", "#3b82f6", "#8b5cf6"]}
        amplitude={1.2}
        blend={0.6}
        speed={0.8}
      />
      
      {/* Contenido */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/20 shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            ¿Cuánto gasto?
          </h2>
          <p className="mt-2 text-sm text-white/80 drop-shadow">
            Gestiona tus finanzas personales de manera simple
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 shadow-xl">
          <AuthForm />
        </div>
      </div>
    </div>
  )
} 