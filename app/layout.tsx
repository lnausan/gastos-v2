import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster } from 'sonner'
import Header from '@/components/layout/header'
import { TransactionProvider } from "@/context/transaction-context"
import SupabaseProvider from '@/components/providers/supabase-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Gastos',
  description: 'Control de gastos personales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
          <TransactionProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
                <main className="flex-1 container py-6">
                  {children}
                </main>
            </div>
            <Toaster />
          </TransactionProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
