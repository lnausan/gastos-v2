"use client"

import { ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/context/transaction-context"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

interface MonthSummaryProps {
  month: string
}

export default function MonthSummary({ month }: MonthSummaryProps) {
  const { getMonthSummary } = useTransactions()
  const summary = getMonthSummary(month)

  const formatDate = (dateString: string) => {
    const date = parse(dateString, "yyyy-MM", new Date())
    return format(date, "MMMM yyyy", { locale: es })
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{summary.income.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{formatDate(month)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Gastos</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{summary.expense.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">{formatDate(month)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo</CardTitle>
          <div className={summary.balance >= 0 ? "text-green-500" : "text-red-500"}>
            {summary.balance >= 0 ? "+" : "-"}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.balance >= 0 ? "text-green-500" : "text-red-500"}`}>
            {Math.abs(summary.balance).toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">{formatDate(month)}</p>
        </CardContent>
      </Card>
    </div>
  )
}
