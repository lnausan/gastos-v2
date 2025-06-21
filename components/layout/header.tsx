'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Wallet, LogOut } from 'lucide-react'
import { useTransactions } from '@/context/transaction-context'

export default function Header() {
  const { clearAllData } = useTransactions()

  const handleLogout = () => {
    console.log("Cerrando sesión y limpiando datos...")
    clearAllData()
    // Navegación inmediata
    window.location.href = '/auth'
  }

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition">
          <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-300 opacity-80" />
          <h1 className="text-xl font-bold">¿Cuánto gasto?</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-sm font-medium">
              Dashboard
            </Button>
          </Link>
          <Link href="/historial">
            <Button variant="ghost" className="text-sm font-medium">
              Historial
            </Button>
          </Link>
          <ThemeSwitcher />
          <a
            href="/auth"
            onClick={() => {
              console.log("Cerrando sesión y limpiando datos...")
              clearAllData()
            }}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </a>
          <div className="text-sm text-muted-foreground">
            Modo Demo
          </div>
        </div>
      </div>
    </header>
  )
} 