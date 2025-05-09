"use client"

import Link from "next/link"
import { Wallet, User2 } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useSupabase } from '@/components/providers/supabase-provider'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react"

export default function Header() {
  const pathname = usePathname()
  const { supabase } = useSupabase()
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) return;
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUserEmail(data?.user?.email || null);
      } catch (e) {
        setUserEmail(null);
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
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

          {userEmail && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User2 className="h-5 w-5" />
              <span>{userEmail}</span>
            </div>
          )}

          <Button variant="outline" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </header>
  )
}
