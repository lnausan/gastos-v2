"use client"

import { useTransactions } from "@/context/transaction-context"
import { ArrowUpIcon, ArrowDownIcon, EqualIcon, DollarSign, Download, FileText, Archive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateMonthlyReport, generateAnnualReport } from "@/lib/pdf-generator"
import { toast } from 'sonner'
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

const MONTHS_ES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
]

function formatMonth(month: string) {
  const [year, m] = month.split('-')
  return `${MONTHS_ES[parseInt(m, 10) - 1]} ${year}`
}

export default function HistorialPage() {
  const { 
    getAllMonthsSummary, 
    dollarValues, 
    getMonthTransactions, 
    getMonthSummary,
    getClosedMonths,
    cleanupDuplicateClosedMonths
  } = useTransactions()
  const summaries = getAllMonthsSummary()
  const closedMonths = getClosedMonths()

  // Unir el valor del dólar a cada mes
  const data = summaries.map((summary) => {
    const dollar = dollarValues.find((d) => d.month === summary.month)
    return { ...summary, dollar: dollar?.value }
  })

  // Solo mostrar meses con algún dato relevante
  const filtered = data.filter(
    d => d.income !== 0 || d.expense !== 0 || d.dollar !== undefined
  )

  const handleDownloadMonthlyReport = async (month: string) => {
    try {
      const transactions = getMonthTransactions(month, true) // Incluir transacciones archivadas
      const monthSummary = getMonthSummary(month)
      const dollarValue = dollarValues.find(d => d.month === month)
      
      const doc = await generateMonthlyReport(month, transactions, monthSummary, dollarValue)
      const fileName = `reporte-mensual-${month}.pdf`
      doc.save(fileName)
      
      toast.success(`Reporte de ${formatMonth(month)} descargado correctamente`)
    } catch (error) {
      console.error('Error al generar reporte mensual:', error)
      toast.error('Error al generar el reporte')
    }
  }

  const handleDownloadAnnualReport = async () => {
    try {
      const doc = await generateAnnualReport(summaries, dollarValues)
      const currentYear = new Date().getFullYear()
      const fileName = `reporte-anual-${currentYear}.pdf`
      doc.save(fileName)
      
      toast.success(`Reporte anual ${currentYear} descargado correctamente`)
    } catch (error) {
      console.error('Error al generar reporte anual:', error)
      toast.error('Error al generar el reporte anual')
    }
  }

  const handleCleanupDuplicates = () => {
    const beforeCount = closedMonths.length
    cleanupDuplicateClosedMonths()
    const afterCount = getClosedMonths().length
    const removedCount = beforeCount - afterCount
    
    if (removedCount > 0) {
      toast.success(`Se eliminaron ${removedCount} meses duplicados`)
    } else {
      toast.info('No se encontraron meses duplicados')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
          <p className="text-muted-foreground">Revisa el historial de tus finanzas personales.</p>
        </div>

        <Button onClick={handleDownloadAnnualReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Reporte Anual
        </Button>
      </div>

      {/* Sección de meses cerrados */}
      {closedMonths.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Meses Cerrados</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCleanupDuplicates}
              className="flex items-center gap-2"
            >
              <Archive className="h-4 w-4" />
              Limpiar Duplicados
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {closedMonths.map((closedMonth) => (
              <div key={closedMonth.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{formatMonth(closedMonth.month)}</h3>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(closedMonth.closed_at), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ingresos:</span>
                    <span className="text-green-600 font-medium">
                      ${closedMonth.income.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gastos:</span>
                    <span className="text-red-600 font-medium">
                      ${closedMonth.expense.toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-medium">Balance:</span>
                    <span className={`font-bold ${
                      closedMonth.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${closedMonth.balance.toLocaleString('es-AR')}
                    </span>
                  </div>
                  {closedMonth.carry_over_amount && closedMonth.carry_over_amount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Llevado al próximo mes:</span>
                      <span className="text-blue-600 font-medium">
                        ${closedMonth.carry_over_amount.toLocaleString('es-AR')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {closedMonth.transaction_count} transacciones archivadas
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabla de resumen mensual */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Resumen Mensual</h2>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">Mes</th>
                <th className="text-right p-3 font-medium">Ingresos</th>
                <th className="text-right p-3 font-medium">Gastos</th>
                <th className="text-right p-3 font-medium">Balance</th>
                <th className="text-right p-3 font-medium">Dólar</th>
                <th className="text-center p-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-muted-foreground">
                    No hay datos registrados
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.month} className="border-b border-border hover:bg-muted/30 transition">
                    <td className="py-2 px-2 font-medium">{formatMonth(d.month)}</td>
                    <td className="py-2 px-2 text-right text-green-600">
                      ${d.income.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right text-red-600">
                      ${d.expense.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className={`py-2 px-2 text-right font-semibold ${d.balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>
                      ${d.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-2 px-2 text-right text-yellow-600">
                      {d.dollar !== undefined
                        ? `$${Number(d.dollar).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`
                        : <span className="text-muted-foreground">No establecido</span>
                      }
                    </td>
                    <td className="py-2 px-2 text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadMonthlyReport(d.month)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
