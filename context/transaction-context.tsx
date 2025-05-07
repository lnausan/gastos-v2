"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useId, useOptimistic, startTransition } from "react"
import type { Transaction, MonthSummary, DollarValue } from "@/types/transaction"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from 'sonner'

interface TransactionContextType {
  transactions: Transaction[]
  dollarValues: DollarValue[]
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt" | "user_id">) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getMonthTransactions: (month: string) => Transaction[]
  getMonthSummary: (month: string) => MonthSummary
  getLastSixMonthsSummary: () => MonthSummary[]
  getAllMonthsSummary: () => MonthSummary[]
  getDollarValue: (month: string) => DollarValue | undefined
  updateDollarValue: (month: string, value: number) => Promise<void>
  getMonthCategorySummary: (month: string, type: "ingreso" | "gasto") => { category: string; amount: number }[]
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
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
    if (!supabase) return

    const loadData = async () => {
      try {
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false })

        if (transactionsError) throw transactionsError
        setTransactions(transactionsData || [])

        const { data: dollarValuesData, error: dollarValuesError } = await supabase
          .from('dollar_values')
          .select('*')
          .order('month', { ascending: false })

        if (dollarValuesError) throw dollarValuesError
        setDollarValues(dollarValuesData || [])
      } catch (error) {
        console.error('Error al cargar datos:', error)
        toast.error('Error al cargar los datos')
      }
    }

    loadData()
  }, [supabase])

  // Guardar transacciones y valores del dólar en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(`transactions-${storageId}`, JSON.stringify(transactions))
  }, [transactions, storageId])

  useEffect(() => {
    localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(dollarValues))
  }, [dollarValues, storageId])

  // Agregar una nueva transacción
  const addTransaction = async (transaction: Omit<Transaction, "id" | "createdAt" | "user_id">) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transaction])
        .select()
        .single()

      if (error) throw error

      setTransactions((prev) => [data, ...prev])
      toast.success('Transacción agregada correctamente')
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      toast.error('Error al agregar la transacción')
      throw error
    }
  }

  // Actualizar una transacción existente
  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(transaction)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      )
      toast.success('Transacción actualizada correctamente')
    } catch (error) {
      console.error('Error al actualizar transacción:', error)
      toast.error('Error al actualizar la transacción')
      throw error
    }
  }

  // Eliminar una transacción
  const deleteTransaction = async (id: string) => {
    if (!supabase) return

    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id)

      if (error) throw error

      setTransactions((prev) => prev.filter((t) => t.id !== id))
      toast.success('Transacción eliminada correctamente')
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      toast.error('Error al eliminar la transacción')
      throw error
    }
  }

  // Obtener transacciones de un mes específico
  const getMonthTransactions = (month: string) => {
    return transactions.filter((t) => t.date === month)
  }

  // Obtener resumen de un mes específico
  const getMonthSummary = (month: string): MonthSummary => {
    const monthTransactions = getMonthTransactions(month)
    const income = monthTransactions
      .filter((t) => t.type === 'ingreso')
      .reduce((sum, t) => sum + t.amount, 0)
    const expense = monthTransactions
      .filter((t) => t.type === 'gasto')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month,
      income,
      expense,
      balance: income - expense,
    }
  }

  // Obtener resumen por categoría para un mes específico
  const getMonthCategorySummary = (month: string, type: 'ingreso' | 'gasto') => {
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

    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      months.push(month)
    }

    return months.map((month) => getMonthSummary(month)).reverse()
  }

  // Obtener todos los meses del año actual para el gráfico de líneas
  const getAllMonthsSummary = (): MonthSummary[] => {
    const currentYear = new Date().getFullYear()
    const months: string[] = []

    for (let i = 0; i < 12; i++) {
      const month = `${currentYear}-${String(i + 1).padStart(2, '0')}`
      months.push(month)
    }

    return months.map((month) => getMonthSummary(month))
  }

  // Obtener el valor del dólar para un mes específico
  const getDollarValue = (month: string): DollarValue | undefined => {
    return dollarValues.find((d) => d.month === month)
  }

  // Actualizar el valor del dólar para un mes específico
  const updateDollarValue = async (month: string, value: number) => {
    if (!supabase) return

    try {
      const existingDollar = dollarValues.find((d) => d.month === month)
      const dollarValue = {
        id: existingDollar?.id,
        month,
        value,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('dollar_values')
        .upsert(dollarValue)
        .select()
        .single()

      if (error) throw error

      setDollarValues((prev) => {
        const existingIndex = prev.findIndex((d) => d.month === month)
        if (existingIndex >= 0) {
          return prev.map((d) => (d.month === month ? data : d))
        } else {
          return [...prev, data]
        }
      })

      toast.success('Valor del dólar actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar valor del dólar:', error)
      toast.error('Error al actualizar el valor del dólar')
      throw error
    }
  }

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        dollarValues,
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
