"use client"

import type { MonthSummary } from "@/types/transaction"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useState, useEffect } from "react"

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
    .from("transactions")
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
      <h1 className="text-2xl font-bold mb-4">Historial de meses</h1>
      <ul>
        {summaries.map((summary) => (
          <li key={summary.month}>
            {summary.month}: Ingresos: {summary.income}, Gastos: {summary.expense}, Balance: {summary.balance}
          </li>
        ))}
      </ul>
    </div>
  )
}
