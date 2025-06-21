'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Wallet } from 'lucide-react'

export default function Header() {
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
          <div className="text-sm text-muted-foreground">
            Modo Demo
          </div>
        </div>
      </div>
    </header>
  )
} 