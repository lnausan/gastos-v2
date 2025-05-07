"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useId, useOptimistic } from "react"
import type { Transaction, MonthSummary, DollarValue } from "@/types/transaction"
import { useToast } from "@/components/ui/use-toast"

interface TransactionContextType {
  transactions: Transaction[]
  dollarValues: DollarValue[]
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => void
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  getMonthTransactions: (month: string) => Transaction[]
  getMonthSummary: (month: string) => MonthSummary
  getLastSixMonthsSummary: () => MonthSummary[]
  getAllMonthsSummary: () => MonthSummary[]
  getDollarValue: (month: string) => DollarValue | undefined
  updateDollarValue: (month: string, value: number) => void
  getMonthCategorySummary: (month: string, type: "ingreso" | "gasto") => { category: string; amount: number }[]
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dollarValues, setDollarValues] = useState<DollarValue[]>([])

  const [optimisticTransactions, addOptimisticTransaction] = useOptimistic<
    Transaction[],
    { action: "add" | "update" | "delete"; data: any }
  >(transactions, (state, { action, data }) => {
    if (action === "add") {
      return [...state, data]
    } else if (action === "update") {
      return state.map((t) => (t.id === data.id ? { ...t, ...data.transaction } : t))
    } else if (action === "delete") {
      return state.filter((t) => t.id !== data.id)
    }
    return state
  })

  const [optimisticDollarValues, addOptimisticDollarValue] = useOptimistic<
    DollarValue[],
    { action: "update"; data: any }
  >(dollarValues, (state, { action, data }) => {
    if (action === "update") {
      const existingIndex = state.findIndex((d) => d.month === data.month)
      if (existingIndex >= 0) {
        return state.map((d) => (d.month === data.month ? data : d))
      } else {
        return [...state, data]
      }
    }
    return state
  })

  const { toast } = useToast()
  const storageId = useId()

  // Cargar transacciones y valores del dólar desde localStorage al iniciar
  useEffect(() => {
    const savedTransactions = localStorage.getItem(`transactions-${storageId}`)
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }

    const savedDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
    if (savedDollarValues) {
      setDollarValues(JSON.parse(savedDollarValues))
    }
  }, [storageId])

  // Guardar transacciones y valores del dólar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`transactions-${storageId}`, JSON.stringify(transactions))
  }, [transactions, storageId])

  useEffect(() => {
    localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(dollarValues))
  }, [dollarValues, storageId])

  // Agregar una nueva transacción
  const addTransaction = (transaction: Omit<Transaction, "id" | "createdAt">) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }

    // Actualización optimista
    addOptimisticTransaction({ action: "add", data: newTransaction })

    // Actualización real
    setTransactions((prev) => [...prev, newTransaction])

    toast({
      title: "Transacción agregada",
      description: "La transacción se ha agregado correctamente.",
    })
  }

  // Actualizar una transacción existente
  const updateTransaction = (id: string, transaction: Partial<Transaction>) => {
    // Actualización optimista
    addOptimisticTransaction({ action: "update", data: { id, transaction } })

    // Actualización real
    setTransactions((prev) => prev.map((t) => (t.id === id ? { ...t, ...transaction } : t)))

    toast({
      title: "Transacción actualizada",
      description: "La transacción se ha actualizado correctamente.",
    })
  }

  // Eliminar una transacción
  const deleteTransaction = (id: string) => {
    // Actualización optimista
    addOptimisticTransaction({ action: "delete", data: { id } })

    // Actualización real
    setTransactions((prev) => prev.filter((t) => t.id !== id))

    toast({
      title: "Transacción eliminada",
      description: "La transacción se ha eliminado correctamente.",
    })
  }

  // Obtener transacciones de un mes específico
  const getMonthTransactions = (month: string) => {
    return optimisticTransactions.filter((t) => t.date === month)
  }

  // Obtener resumen de un mes específico
  const getMonthSummary = (month: string): MonthSummary => {
    const monthTransactions = getMonthTransactions(month)

    const income = monthTransactions.filter((t) => t.type === "ingreso").reduce((sum, t) => sum + t.amount, 0)

    const expense = monthTransactions.filter((t) => t.type === "gasto").reduce((sum, t) => sum + t.amount, 0)

    return {
      month,
      income,
      expense,
      balance: income - expense,
    }
  }

  // Obtener resumen por categoría para un mes específico
  const getMonthCategorySummary = (month: string, type: "ingreso" | "gasto") => {
    const monthTransactions = getMonthTransactions(month).filter((t) => t.type === type)

    const categorySummary: Record<string, number> = {}

    monthTransactions.forEach((transaction) => {
      if (!categorySummary[transaction.category]) {
        categorySummary[transaction.category] = 0
      }
      categorySummary[transaction.category] += transaction.amount
    })

    return Object.entries(categorySummary)
      .map(([category, amount]) => ({
        category,
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  // Obtener los últimos 6 meses para el gráfico de barras
  const getLastSixMonthsSummary = (): MonthSummary[] => {
    const today = new Date()
    const months: string[] = []

    // Generar los últimos 6 meses en formato YYYY-MM
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      months.push(month)
    }

    // Obtener el resumen para cada mes
    return months.map((month) => getMonthSummary(month)).reverse()
  }

  // Obtener todos los meses del año actual para el gráfico de líneas
  const getAllMonthsSummary = (): MonthSummary[] => {
    const currentYear = new Date().getFullYear()
    const months: string[] = []

    // Generar todos los meses del año actual en formato YYYY-MM
    for (let i = 0; i < 12; i++) {
      const month = `${currentYear}-${String(i + 1).padStart(2, "0")}`
      months.push(month)
    }

    // Obtener el resumen para cada mes
    return months.map((month) => getMonthSummary(month))
  }

  // Obtener el valor del dólar para un mes específico
  const getDollarValue = (month: string): DollarValue | undefined => {
    return optimisticDollarValues.find((d) => d.month === month)
  }

  // Actualizar el valor del dólar para un mes específico
  const updateDollarValue = (month: string, value: number) => {
    const existingDollar = dollarValues.find((d) => d.month === month)

    const updatedDollar: DollarValue = {
      id: existingDollar?.id || crypto.randomUUID(),
      month,
      value,
      updatedAt: Date.now(),
    }

    // Actualización optimista
    addOptimisticDollarValue({ action: "update", data: updatedDollar })

    // Actualización real
    setDollarValues((prev) => {
      const existingIndex = prev.findIndex((d) => d.month === month)
      if (existingIndex >= 0) {
        return prev.map((d) => (d.month === month ? updatedDollar : d))
      } else {
        return [...prev, updatedDollar]
      }
    })

    toast({
      title: "Valor del dólar actualizado",
      description: "El valor del dólar se ha actualizado correctamente.",
    })
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions: optimisticTransactions,
        dollarValues: optimisticDollarValues,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getMonthTransactions,
        getMonthSummary,
        getLastSixMonthsSummary,
        getAllMonthsSummary,
        getDollarValue,
        updateDollarValue,
        getMonthCategorySummary,
      }}
    >
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransactions() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error("useTransactions must be used within a TransactionProvider")
  }
  return context
}
