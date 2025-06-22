"use client"

import { useTransactions } from "@/context/transaction-context"
import { ArrowUpIcon, ArrowDownIcon, EqualIcon, DollarSign, Download, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateMonthlyReport, generateAnnualReport } from "@/lib/pdf-generator"
import { toast } from 'sonner'

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
    getMonthSummary 
  } = useTransactions()
  const summaries = getAllMonthsSummary()

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
      const transactions = getMonthTransactions(month)
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Historial mensual</h1>
        <Button 
          onClick={handleDownloadAnnualReport}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Descargar Reporte Anual
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 px-2">Mes</th>
              <th className="text-right py-2 px-2 font-normal">
                <ArrowUpIcon className="inline h-4 w-4 text-green-500 mr-1" />
                Ingresos
              </th>
              <th className="text-right py-2 px-2 font-normal">
                <ArrowDownIcon className="inline h-4 w-4 text-red-500 mr-1" />
                Gastos
              </th>
              <th className="text-right py-2 px-2 font-normal">
                <EqualIcon className="inline h-4 w-4 text-blue-500 mr-1" />
                Balance
              </th>
              <th className="text-right py-2 px-2 font-normal">
                <DollarSign className="inline h-4 w-4 text-yellow-500 mr-1" />
                Dólar
              </th>
              <th className="text-center py-2 px-2 font-normal">Acciones</th>
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
  )
}
