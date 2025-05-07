import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: '¿Cuánto Gasto?',
    template: '%s | ¿Cuánto Gasto?'
  },
  description: 'Aplicación para el control de gastos personales',
  applicationName: '¿Cuánto Gasto?',
  authors: [{ name: 'Tu Nombre' }],
  generator: 'Next.js',
  keywords: ['gastos', 'finanzas personales', 'control de gastos'],
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
} 