'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export function DollarRate() {
  const [rate, setRate] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDollarRate = async () => {
      try {
        const response = await fetch('https://api.bluelytics.com.ar/v2/latest')
        const data = await response.json()
        setRate(data.blue.value_sell)
      } catch (error) {
        console.error('Error al obtener el valor del dólar:', error)
        toast.error('Error al obtener el valor del dólar')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDollarRate()
    const interval = setInterval(fetchDollarRate, 1000 * 60 * 60) // Actualizar cada hora

    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <div className="h-6 w-24 animate-pulse bg-muted rounded" />
  }

  if (!rate) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground">USD:</span>
      <span className="font-medium">${rate.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </div>
  )
} 