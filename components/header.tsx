"use client"

import Link from "next/link"
import { Wallet, User2 } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      const result = await logout()
      if (result.success) {
        toast("Sesión cerrada correctamente")
        router.push('/auth')
      } else {
        toast("Error al cerrar sesión")
      }
    } catch (error) {
      toast("Error al cerrar sesión")
    }
  }

  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-6 w-6 text-green-500" />
          <h1 className="text-xl font-bold">¿Cuánto Gasto?</h1>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/" className={pathname === "/" ? "font-medium" : ""}>
              Dashboard
            </Link>
            <Link href="/historial" className={pathname === "/historial" ? "font-medium" : ""}>
              Historial
            </Link>
          </nav>

          <ThemeSwitcher />

          <div className="md:hidden">
            <Button variant="ghost" size="sm">
              <span className="sr-only">Menú</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User2 className="h-5 w-5" />
            <span>{user?.email || "usuario@ejemplo.com"}</span>
          </div>

          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
