"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState, useId, useOptimistic, startTransition } from "react"
import type { Transaction, MonthSummary, DollarValue } from "@/types/transaction"
import { useToast } from "@/components/ui/use-toast"
import { useSupabase } from '@/components/providers/supabase-provider'
import { toast } from 'sonner'
import { format, subMonths } from "date-fns"

interface TransactionContextType {
  transactions: Transaction[]
  dollarValues: DollarValue[]
  addTransaction: (transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getMonthTransactions: (month: string) => Transaction[]
  getMonthSummary: (month: string) => MonthSummary
  getLastSixMonthsSummary: () => MonthSummary[]
  getAllMonthsSummary: () => MonthSummary[]
  getDollarValue: (month: string) => DollarValue | undefined
  updateDollarValue: (month: string, value: number) => Promise<void>
  getMonthCategorySummary: (month: string, type: "ingreso" | "gasto") => { category: string; amount: number }[]
  isLoading: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dollarValues, setDollarValues] = useState<DollarValue[]>([])
  const [isLoading, setIsLoading] = useState(true)

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

    // 1. Cargar datos de localStorage primero
    const cachedTransactions = localStorage.getItem(`transactions-${storageId}`)
    if (cachedTransactions) {
      try {
        const parsedTransactions = JSON.parse(cachedTransactions)
        setTransactions(parsedTransactions)
        setIsLoading(false) // Ya tenemos datos, no mostrar loading
      } catch (e) {
        console.error('Error al parsear transacciones del localStorage:', e)
      }
    }

    const cachedDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
    if (cachedDollarValues) {
      try {
        setDollarValues(JSON.parse(cachedDollarValues))
      } catch (e) {
        console.error('Error al parsear valores del dólar del localStorage:', e)
      }
    }

    // 2. Luego cargar desde Supabase en segundo plano
    const loadData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Error al obtener usuario:', userError)
          throw userError
        }
        if (!user) {
          console.error('No hay usuario autenticado')
          return
        }

        // Calcular los últimos 6 meses
        const today = new Date()
        const months: string[] = []
        for (let i = 0; i < 6; i++) {
          const d = subMonths(today, i)
          months.push(format(d, "yyyy-MM"))
        }

        console.log('Buscando transacciones para los meses:', months)

        // Traer solo las transacciones de los últimos 6 meses
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', `${months[months.length - 1]}-01`)
          .lte('date', `${months[0]}-31`)
          .order('created_at', { ascending: false })

        if (transactionsError) {
          console.error('Error al cargar transacciones:', transactionsError)
          throw transactionsError
        }

        if (transactionsData) {
          console.log('Transacciones cargadas:', transactionsData.length)
          setTransactions(transactionsData)
          localStorage.setItem(`transactions-${storageId}`, JSON.stringify(transactionsData))
        }

        console.log('Buscando valores del dólar para los meses:', months)

        // Traer todos los valores del dólar del usuario
        const loadDollarValues = async () => {
          if (!supabase) {
            console.error('Supabase no está inicializado')
            return
          }

          try {
            // 1. Verificar autenticación
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError) {
              console.error('Error al obtener usuario:', userError)
              return
            }
            if (!user) {
              console.error('No hay usuario autenticado')
              return
            }

            console.log('Cargando historial de valores del dólar para usuario:', user.id)

            // 2. Cargar todos los valores históricos
            const { data, error } = await supabase
              .from('dollar_values')
              .select('*')
              .eq('user_id', user.id)
              .order('month', { ascending: false })

            console.log('Respuesta de la carga de dólares:', { data, error })

            if (error) {
              console.error('Error al cargar valores del dólar:', error)
              return
            }

            if (!data) {
              console.log('No se encontraron valores del dólar')
              setDollarValues([])
              localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify([]))
              return
            }

            console.log('Historial de valores del dólar cargados:', data)
            setDollarValues(data)
            localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(data))

          } catch (error) {
            console.error('Error inesperado al cargar valores del dólar:', error)
            setDollarValues([])
            localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify([]))
          }
        }

        // Ejecutar la carga de datos
        await loadDollarValues()
      } catch (error) {
        console.error('Error detallado al cargar datos:', error)
        // No mostrar el error al usuario si ya tenemos datos en localStorage
        if (transactions.length === 0) {
          toast({
            title: 'Error al cargar los datos',
            description: error instanceof Error ? error.message : 'Error desconocido',
            variant: 'destructive'
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Agregar una nueva transacción
  const addTransaction = async (transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">) => {
    if (!supabase) return

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No se pudo obtener el usuario autenticado')
        return
      }

      const expenseToInsert = {
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date,
        category_id: transaction.category_id,
        user_id: user.id,
        type: transaction.type,
    }

      console.log('Insertando en Supabase:', expenseToInsert)

      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseToInsert])
        .select()
        .single()

      console.log('Respuesta de Supabase:', { data, error })

      if (error) throw error

      // Recargar todas las transacciones para asegurar consistencia
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      console.log('Transacciones actualizadas:', transactionsData)
      setTransactions(transactionsData || [])
      toast({ title: 'Transacción agregada correctamente' })
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      toast({ title: 'Error al agregar la transacción' })
      throw error
    }
  }

  // Actualizar una transacción existente
  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    if (!supabase) return

    try {
      // Adaptar los campos al esquema de expenses
      const expenseToUpdate: any = {}
      if (transaction.amount !== undefined) expenseToUpdate.amount = transaction.amount
      if (transaction.description !== undefined) expenseToUpdate.description = transaction.description
      if (transaction.date !== undefined) expenseToUpdate.date = transaction.date
      if (transaction.category_id !== undefined) expenseToUpdate.category_id = transaction.category_id
      if (transaction.type !== undefined) expenseToUpdate.type = transaction.type

      console.log('Actualizando transacción:', { id, ...expenseToUpdate })

      const { data, error } = await supabase
        .from('expenses')
        .update(expenseToUpdate)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      console.log('Transacción actualizada:', data)

      // Recargar todas las transacciones para asegurar consistencia
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      console.log('Transacciones actualizadas:', transactionsData)
      setTransactions(transactionsData || [])
      toast({ title: 'Transacción actualizada correctamente' })
    } catch (error) {
      console.error('Error al actualizar transacción:', error)
      toast({ title: 'Error al actualizar la transacción' })
      throw error
    }
  }

  // Eliminar una transacción
  const deleteTransaction = async (id: string) => {
    if (!supabase) return

    try {
      console.log('Eliminando transacción:', id)

      const { error } = await supabase.from('expenses').delete().eq('id', id)

      if (error) throw error

      // Recargar todas las transacciones para asegurar consistencia
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      console.log('Transacciones actualizadas:', transactionsData)
      setTransactions(transactionsData || [])
      toast({ title: 'Transacción eliminada correctamente' })
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      toast({ title: 'Error al eliminar la transacción' })
      throw error
    }
  }

  // Obtener transacciones de un mes específico
  const getMonthTransactions = (month: string) => {
    return transactions.filter((t) => t.date.startsWith(month))
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
      if (!categorySummary[transaction.category_id]) {
        categorySummary[transaction.category_id] = 0
      }
      categorySummary[transaction.category_id] += transaction.amount
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
    // Obtener todos los meses únicos de las transacciones
    const months = Array.from(new Set(transactions.map(t => t.date.substring(0, 7))))
      .sort((a, b) => b.localeCompare(a)) // Ordenar de más reciente a más antiguo

    return months.map(month => {
      const monthTransactions = transactions.filter(t => t.date.startsWith(month))
      const income = monthTransactions
        .filter(t => t.type === 'ingreso')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const expense = monthTransactions
        .filter(t => t.type === 'gasto')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        month,
        income,
        expense,
        balance: income - expense
      }
    })
  }

  // Obtener el valor del dólar para un mes específico
  const getDollarValue = (month: string): DollarValue | undefined => {
    return dollarValues.find((d) => d.month === month)
  }

  // Actualizar el valor del dólar para un mes específico
  const updateDollarValue = async (month: string, value: number) => {
    if (!supabase) {
      console.error('Supabase no está inicializado')
      throw new Error('Supabase no está inicializado')
    }

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Error al obtener usuario:', userError)
        throw new Error('Error al obtener usuario')
      }
      if (!user) {
        console.error('No hay usuario autenticado')
        throw new Error('No hay usuario autenticado')
      }

      console.log('Actualizando o insertando valor del dólar:', { user_id: user.id, month, value })

      const { data: upsertData, error: upsertError } = await supabase
        .from('dollar_values')
        .upsert(
          [{
            user_id: user.id,
            month,
            value,
          }],
          { onConflict: 'user_id,month' }
        )
        .select()
        .single()

      if (upsertError) {
        console.error('Error al insertar o actualizar:', upsertError)
        throw new Error(`Error al insertar o actualizar: ${upsertError.message}`)
      }

      setDollarValues(prev => {
        const newValues = [...prev]
        const index = newValues.findIndex(d => d.month === month)
        if (index >= 0) {
          newValues[index] = upsertData
        } else {
          newValues.push(upsertData)
        }
        localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(newValues))
        return newValues
      })

      return upsertData
    } catch (error) {
      console.error('Error al actualizar el valor del dólar:', error)
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
        isLoading,
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
