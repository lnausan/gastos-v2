"use client"

import type { MonthSummary } from "@/types/transaction"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState, useEffect } from "react"
import { ArrowUpIcon, ArrowDownIcon, EqualIcon } from "lucide-react"

const supabase = createClientComponentClient()

const getAllMonthsSummary = async (): Promise<MonthSummary[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("Usuario no autenticado", userError)
    return []
  }

  const { data, error } = await supabase
    .from("expenses")
    .select("amount, type, date")
    .eq("user_id", user.id)

  if (error || !data) {
    console.error("Error al obtener transacciones:", error)
    return []
  }

  const resumen: Record<string, MonthSummary> = {}

  data.forEach((tx) => {
    const [year, month] = tx.date.split("-")
    const key = `${year}-${month}`

    if (!resumen[key]) {
      resumen[key] = {
        month: key,
        income: 0,
        expense: 0,
        balance: 0,
      }
    }

    const amount = Number(tx.amount)
    if (tx.type === "ingreso") {
      resumen[key].income += amount
    } else {
      resumen[key].expense += amount
    }

    resumen[key].balance = resumen[key].income - resumen[key].expense
  })

  return Object.values(resumen)
}

export default function HistorialPage() {
  const [summaries, setSummaries] = useState<MonthSummary[]>([])

  useEffect(() => {
    getAllMonthsSummary().then(setSummaries)
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Historial de meses</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="text-left py-2 px-2">Mes</th>
              <th className="text-right py-2 px-2 font-normal"><ArrowUpIcon className="inline h-4 w-4 text-green-500 mr-1" />Ingresos</th>
              <th className="text-right py-2 px-2 font-normal"><ArrowDownIcon className="inline h-4 w-4 text-red-500 mr-1" />Gastos</th>
              <th className="text-right py-2 px-2 font-normal"><EqualIcon className="inline h-4 w-4 text-blue-500 mr-1" />Balance</th>
            </tr>
          </thead>
          <tbody>
            {summaries.map((summary) => (
              <tr key={summary.month} className="border-b border-border hover:bg-muted/30 transition">
                <td className="py-2 px-2 font-medium">{summary.month}</td>
                <td className="py-2 px-2 text-right text-green-600">{summary.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-2 px-2 text-right text-red-600">{summary.expense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className={`py-2 px-2 text-right font-semibold ${summary.balance >= 0 ? "text-blue-600" : "text-orange-600"}`}>{summary.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
