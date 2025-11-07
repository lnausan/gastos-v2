"use client"

import { useState } from "react"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, CheckCircle, ArrowRight, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useTransactions } from "@/context/transaction-context"
import { toast } from "sonner"

interface MonthCloserProps {
  currentMonth: string
  onMonthChange?: (newMonth: string) => void
  onOpenTransactionForm?: () => void
}

export default function MonthCloser({ currentMonth, onMonthChange, onOpenTransactionForm }: MonthCloserProps) {
  const { closeMonth, loadNextMonthTransactions, getMonthSummary, getClosedMonths } = useTransactions()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [carryOverBalance, setCarryOverBalance] = useState(false)
  const [carryOverAmount, setCarryOverAmount] = useState(0)

  const currentSummary = getMonthSummary(currentMonth)
  const closedMonths = getClosedMonths()
  const isMonthAlreadyClosed = closedMonths.some(cm => cm.month === currentMonth)
  
  const [year, monthNum] = currentMonth.split('-')
  const nextMonthDate = new Date(parseInt(year), parseInt(monthNum) - 1 + 1, 1)
  const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`

  const handleCloseMonth = async () => {
    setIsLoading(true)
    try {
      // Determinar el monto a llevar al próximo mes
      let amountToCarry = 0
      if (carryOverBalance && currentSummary.balance > 0) {
        amountToCarry = carryOverAmount > 0 ? carryOverAmount : currentSummary.balance
      } else if (carryOverAmount > 0) {
        amountToCarry = carryOverAmount
      }

      const result = await closeMonth(currentMonth, amountToCarry)
      
      if (result.success) {
        // Cambiar al próximo mes inmediatamente
        if (onMonthChange) {
          onMonthChange(result.nextMonth)
        }
        
        setIsOpen(false)
        toast.success('Mes cerrado y próximo mes preparado exitosamente')

        // Abrir el formulario de transacciones después de un pequeño delay
        // para asegurar que el cambio de mes se haya procesado
        if (onOpenTransactionForm) {
          setTimeout(() => {
            onOpenTransactionForm()
          }, 500) // Reducido a 500ms para mejor respuesta
        }
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error al cerrar el mes:', error)
      toast.error('Error al cerrar el mes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCarryOverToggle = (checked: boolean) => {
    setCarryOverBalance(checked)
    if (checked && currentSummary.balance > 0) {
      setCarryOverAmount(currentSummary.balance)
    } else {
      setCarryOverAmount(0)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2" 
          disabled={isMonthAlreadyClosed}
        >
          <CheckCircle className="h-4 w-4" />
          {isMonthAlreadyClosed ? 'Mes Ya Cerrado' : 'Cerrar Mes'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cerrar Mes - {format(parse(currentMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: es })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Advertencia si el mes ya está cerrado */}
          {isMonthAlreadyClosed && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Este mes ya está cerrado
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                No puedes cerrar un mes que ya ha sido cerrado anteriormente.
              </p>
            </div>
          )}

          {/* Resumen del mes actual */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen del Mes</CardTitle>
              <CardDescription>Balance final del mes que se va a cerrar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Ingresos:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  ${currentSummary.income.toLocaleString('es-AR')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Gastos:</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  ${currentSummary.expense.toLocaleString('es-AR')}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">USDT:</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">
                  ${currentSummary.usdt.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CEDEARS:</span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  ${currentSummary.cedears.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Balance Final:</span>
                <span className={`font-bold text-lg ${
                  currentSummary.balance >= 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ${currentSummary.balance.toLocaleString('es-AR')}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Opciones para el próximo mes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Próximo Mes: {format(parse(nextMonth, "yyyy-MM", new Date()), "MMMM yyyy", { locale: es })}
              </CardTitle>
              <CardDescription>Configura las opciones para el próximo mes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Opción para llevar balance */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="carry-over">Llevar balance al próximo mes</Label>
                  <p className="text-sm text-muted-foreground">
                    Crear una transacción de ingreso inicial con el balance actual
                  </p>
                </div>
                <Switch
                  id="carry-over"
                  checked={carryOverBalance}
                  onCheckedChange={handleCarryOverToggle}
                  disabled={currentSummary.balance <= 0}
                />
              </div>

              {/* Monto personalizado */}
              {carryOverBalance && (
                <div className="space-y-2">
                  <Label htmlFor="carry-amount">Monto a llevar (opcional)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="carry-amount"
                      type="number"
                      placeholder={currentSummary.balance.toString()}
                      value={carryOverAmount || ''}
                      onChange={(e) => setCarryOverAmount(Number(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deja vacío para usar el balance completo (${currentSummary.balance.toLocaleString('es-AR')})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCloseMonth} 
              disabled={isLoading || isMonthAlreadyClosed}
            >
              {isLoading ? 'Cerrando...' : 'Cerrar Mes y Continuar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 