"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { Wallet } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Contenido */}
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold">
            ¿Cuánto gasto?
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Gestiona tus finanzas personales de manera simple
          </p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  )
} 