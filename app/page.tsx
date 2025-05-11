"use client"

import { useState, Suspense } from "react"
import { format } from "date-fns"
import { Plus, ArrowUpIcon, ArrowDownIcon, DollarSign } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import TransactionForm from "@/components/transaction-form"
import BarChart from "@/components/charts/bar-chart"
import TransactionList from "@/components/transaction-list"
import MonthSelector from "@/components/month-selector"
import DollarValue from "@/components/dollar-value"
import CategorySummary from "@/components/category-summary"
import { useTransactions } from "@/context/transaction-context"
import DashboardSkeleton from '@/components/dashboard-skeleton'

function ChartSkeleton() {
  return (
    <div className="w-full h-[300px] flex items-center justify-center bg-muted/20 rounded-lg animate-pulse">
      <p className="text-muted-foreground">Cargando gráfico...</p>
    </div>
  )
}

function BarChartWithData({ data }: { data: any }) {
  return <BarChart data={data} />
}

export default function DashboardPage() {
  const { getLastSixMonthsSummary, getMonthSummary, getDollarValue, isLoading, transactions } = useTransactions()
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [isFormOpen, setIsFormOpen] = useState(false)

  const summary = getMonthSummary(selectedMonth)
  const dollarValue = getDollarValue(selectedMonth)

  if (isLoading && transactions.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Visualiza y gestiona tus finanzas personales.</p>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visualiza y gestiona tus finanzas personales.</p>
        </div>

        <div className="flex items-center gap-4">
          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />

          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Nueva transacción
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" aria-describedby="new-transaction-desc">
              <DialogHeader>
                <DialogTitle>Nueva transacción</DialogTitle>
              </DialogHeader>
              <p id="new-transaction-desc" className="sr-only">
                Completa los campos para agregar una nueva transacción.
              </p>
              <TransactionForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sección destacada para el valor del dólar */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-1">
          <DollarValue month={selectedMonth} />
        </div>

        <div className="md:col-span-3 grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-green-700 dark:text-green-300">
                <ArrowUpIcon className="mr-2 h-4 w-4" />
                Ingresos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {summary.income.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {summary.income > 0 && dollarValue && (
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <DollarSign className="mr-1 h-3 w-3" />
                  USD {(summary.income / dollarValue.value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-red-200 dark:border-red-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center text-red-700 dark:text-red-300">
                <ArrowDownIcon className="mr-2 h-4 w-4" />
                Gastos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.expense.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {summary.expense > 0 && dollarValue && (
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <DollarSign className="mr-1 h-3 w-3" />
                  USD {(summary.expense / dollarValue.value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card
            className={`bg-gradient-to-br ${
              summary.balance >= 0
                ? "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800"
                : "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800"
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle
                className={`text-sm font-medium ${
                  summary.balance >= 0 ? "text-blue-700 dark:text-blue-300" : "text-orange-700 dark:text-orange-300"
                }`}
              >
                Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {summary.balance.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {dollarValue && (
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                  <DollarSign className="mr-1 h-3 w-3" />
                  USD {(summary.balance / dollarValue.value).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transacciones recientes</CardTitle>
              <CardDescription>Lista de transacciones del mes seleccionado.</CardDescription>
            </CardHeader>
            <CardContent>
              <TransactionList month={selectedMonth} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos vs Gastos</CardTitle>
              <CardDescription>Comparativa de los últimos 6 meses.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<ChartSkeleton />}>
                <BarChartWithData data={getLastSixMonthsSummary()} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <CategorySummary month={selectedMonth} type="ingreso" />
            <CategorySummary month={selectedMonth} type="gasto" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
