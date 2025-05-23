"use client"

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button'

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)

    toast({
      title: "Tema cambiado",
      description: `Se ha activado el modo ${newTheme === "light" ? "claro" : "oscuro"}.`,
      duration: 2000,
    })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-transform duration-200 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-transform duration-200 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
