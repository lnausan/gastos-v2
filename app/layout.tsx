import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Header from "@/components/header"
import { TransactionProvider } from "@/context/transaction-context"
import SupabaseProvider from "@/components/providers/supabase-provider"
import { metadata } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="cuanto-gasto-theme">
          <SupabaseProvider>
            <TransactionProvider>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 container mx-auto py-6 px-4">{children}</main>
              </div>
              <Toaster />
            </TransactionProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
