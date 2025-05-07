"use client"

import { useState, Suspense } from "react"
import { format } from "date-fns"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MonthSelector from "@/components/month-selector"
import TransactionList from "@/components/transaction-list"
import LineChart from "@/components/charts/line-chart"
import { useTransactions } from "@/context/transaction-context"

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
      <p className="text-muted-foreground">Cargando gráfico...</p>
    </div>
  )
}

function LineChartWithData({ data }: { data: any }) {
  return <LineChart data={data} />
}

export default function HistorialPage() {
  const { getAllMonthsSummary } = useTransactions()
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historial</h1>
          <p className="text-muted-foreground">Revisa el historial de tus transacciones.</p>
        </div>

        <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Evolución del saldo</CardTitle>
            <CardDescription>Evolución del saldo mes a mes durante el año.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<ChartSkeleton />}>
              <LineChartWithData data={getAllMonthsSummary()} />
            </Suspense>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Transacciones del mes</CardTitle>
            <CardDescription>Lista simplificada de transacciones del mes seleccionado.</CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionList month={selectedMonth} simplified />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
