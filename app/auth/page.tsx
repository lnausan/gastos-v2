"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { Wallet } from "lucide-react"

// Temporary Debug Component to be removed later
const DebugEnvVars = () => {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-800/50 dark:text-yellow-300">
      <h3 className="font-bold">Valores de Entorno (DEBUG)</h3>
      <p className="text-sm">
        Compara estos valores con tu archivo <code>.env.local</code>. Deben ser idénticos.
      </p>
      <ul className="mt-2 text-xs font-mono break-all list-disc list-inside">
        <li><strong>API_KEY:</strong> {process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "NO DEFINIDO"}</li>
        <li><strong>AUTH_DOMAIN:</strong> {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "NO DEFINIDO"}</li>
        <li><strong>PROJECT_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "NO DEFINIDO"}</li>
        <li><strong>STORAGE_BUCKET:</strong> {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "NO DEFINIDO"}</li>
        <li><strong>MESSAGING_SENDER_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "NO DEFINIDO"}</li>
        <li><strong>APP_ID:</strong> {process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "NO DEFINIDO"}</li>
      </ul>
    </div>
  );
};


export default function AuthPage() {
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
        
        <AuthForm />
        
        {/* --- TEMPORARY DEBUG COMPONENT --- */}
        <DebugEnvVars />
        {/* ----------------------------------- */}

      </div>
    </div>
  )
} 