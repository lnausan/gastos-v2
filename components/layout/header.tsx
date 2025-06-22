'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Wallet, LogOut, User } from 'lucide-react'
import { useTransactions } from '@/context/transaction-context'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Header() {
  const { clearAllData } = useTransactions()
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        clearAllData()
        toast("Sesión cerrada exitosamente")
        router.push('/auth')
      } else {
        toast("Error al cerrar sesión")
      }
    } catch (error) {
      toast("Error inesperado al cerrar sesión")
    }
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
          {user && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                {user.email}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
} 