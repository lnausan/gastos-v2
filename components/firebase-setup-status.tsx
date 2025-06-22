"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface FirebaseSetupStatusProps {
  onRetry: () => void
}

export function FirebaseSetupStatus({ onRetry }: FirebaseSetupStatusProps) {
  const { user } = useAuth()
  const [showDetails, setShowDetails] = useState(false)

  const indexLinks = [
    {
      name: "Transacciones (userId + date DESC)",
      url: "https://console.firebase.google.com/v1/r/project/gastos-v2-49841/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYW5zYWN0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoJCgVkYXRlEAIaDAoIX19uYW1lX18QAg"
    },
    {
      name: "Valores del dólar (userId + month DESC)",
      url: "https://console.firebase.google.com/v1/r/project/gastos-v2-49841/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL2RvbGxhclZhbHVlcy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoJCgVtb250aBACGgwKCF9fbmFtZV9fEAI"
    },
    {
      name: "Transacciones por mes (userId + date ASC + DESC)",
      url: "https://console.firebase.google.com/v1/r/project/gastos-v2-49841/firestore/indexes?create_composite=ClRwcm9qZWN0cy9nYXN0b3MtdjItNDk4NDEvZGF0YWJhc2VzLyhkZWZhdWx0KS9jb2xsZWN0aW9uR3JvdXBzL3RyYW5zYWN0aW9ucy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoJCgVkYXRlEAIaCQoFZGF0ZRACGgwKCF9fbmFtZV9fEAI"
    }
  ]

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
          <AlertCircle className="mr-2 h-5 w-5" />
          Configuración de Firebase en progreso
        </CardTitle>
        <CardDescription className="text-orange-600 dark:text-orange-400">
          Se están creando los índices necesarios para que la aplicación funcione correctamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription className="text-orange-700 dark:text-orange-300">
            Los índices de Firestore están siendo creados. Esto puede tomar 5-10 minutos. 
            Mientras tanto, puedes usar la aplicación con datos locales.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900"
          >
            {showDetails ? "Ocultar detalles" : "Ver enlaces para crear índices"}
          </Button>

          {showDetails && (
            <div className="space-y-3 p-4 bg-white dark:bg-gray-800 rounded-lg border">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Haz clic en cada enlace para crear los índices necesarios:
              </p>
              
              {indexLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-sm font-medium">{link.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Crear
                  </Button>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Pasos:</strong>
                </p>
                <ol className="text-sm text-blue-600 dark:text-blue-400 mt-2 space-y-1">
                  <li>1. Haz clic en "Crear" para cada índice</li>
                  <li>2. En Firebase Console, haz clic en "Create index"</li>
                  <li>3. Espera hasta que el estado sea "Enabled"</li>
                  <li>4. Haz clic en "Reintentar" abajo</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onRetry}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.open('https://console.firebase.google.com/project/gastos-v2-49841/firestore/indexes', '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Ver índices
          </Button>
        </div>

        <div className="text-xs text-orange-600 dark:text-orange-400">
          <p><strong>Nota:</strong> Los datos se guardarán localmente mientras se crean los índices.</p>
          <p>Una vez completados, se sincronizarán automáticamente con Firebase.</p>
        </div>
      </CardContent>
    </Card>
  )
} 