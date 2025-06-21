"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useId } from "react"
import type { Transaction, MonthSummary, DollarValue } from "@/types/transaction"
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { transactionsService } from '@/lib/transactions'

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
  isFirebaseEnabled: boolean
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dollarValues, setDollarValues] = useState<DollarValue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false)
  const storageId = useId()
  const { user } = useAuth()

  // Verificar si Firebase está configurado
  useEffect(() => {
    const checkFirebaseConfig = () => {
      const hasConfig = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      )
      setIsFirebaseEnabled(hasConfig)
      console.log('Firebase configurado:', hasConfig)
    }
    
    checkFirebaseConfig()
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Cargando datos...')
        
        if (isFirebaseEnabled && user) {
          // Cargar desde Firebase
          console.log('Cargando desde Firebase...')
          const result = await transactionsService.getTransactions(user.uid)
          if (result.success && result.transactions) {
            setTransactions(result.transactions)
            console.log('Transacciones cargadas desde Firebase:', result.transactions.length)
          } else {
            console.error('Error al cargar desde Firebase:', result.error)
            loadLocalData()
          }
        } else {
          // Cargar datos locales
          loadLocalData()
        }
        
        console.log('Datos cargados correctamente')
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        loadLocalData()
        toast('Error al cargar los datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    const loadLocalData = () => {
      // Datos de prueba para desarrollo
      const mockTransactions: Transaction[] = [
        {
          id: '1',
          amount: 50000,
          type: 'ingreso',
          category_id: 'salario',
          date: '2024-01-15',
          description: 'Salario enero',
          created_at: '2024-01-15T10:00:00Z',
          updated_at: '2024-01-15T10:00:00Z',
          user_id: 'mock-user'
        },
        {
          id: '2',
          amount: 15000,
          type: 'gasto',
          category_id: 'alimentacion',
          date: '2024-01-20',
          description: 'Supermercado',
          created_at: '2024-01-20T15:30:00Z',
          updated_at: '2024-01-20T15:30:00Z',
          user_id: 'mock-user'
        },
        {
          id: '3',
          amount: 8000,
          type: 'gasto',
          category_id: 'transporte',
          date: '2024-01-22',
          description: 'Combustible',
          created_at: '2024-01-22T09:15:00Z',
          updated_at: '2024-01-22T09:15:00Z',
          user_id: 'mock-user'
        },
        {
          id: '4',
          amount: 60000,
          type: 'ingreso',
          category_id: 'salario',
          date: '2024-02-15',
          description: 'Salario febrero',
          created_at: '2024-02-15T10:00:00Z',
          updated_at: '2024-02-15T10:00:00Z',
          user_id: 'mock-user'
        },
        {
          id: '5',
          amount: 12000,
          type: 'gasto',
          category_id: 'vivienda',
          date: '2024-02-01',
          description: 'Alquiler',
          created_at: '2024-02-01T12:00:00Z',
          updated_at: '2024-02-01T12:00:00Z',
          user_id: 'mock-user'
        }
      ]
      
      const mockDollarValues: DollarValue[] = [
        {
          id: '1',
          month: '2024-01',
          value: 850,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          user_id: 'mock-user'
        },
        {
          id: '2',
          month: '2024-02',
          value: 900,
          created_at: '2024-02-01T00:00:00Z',
          updated_at: '2024-02-01T00:00:00Z',
          user_id: 'mock-user'
        }
      ]
      
      // Intentar cargar desde localStorage primero
      const cachedTransactions = localStorage.getItem(`transactions-${storageId}`)
      const cachedDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
      
      if (cachedTransactions) {
        try {
          const parsedTransactions = JSON.parse(cachedTransactions)
          setTransactions(parsedTransactions)
          console.log('Transacciones cargadas desde localStorage:', parsedTransactions.length)
        } catch (e) {
          console.error('Error al parsear transacciones del localStorage:', e)
          setTransactions(mockTransactions)
          localStorage.setItem(`transactions-${storageId}`, JSON.stringify(mockTransactions))
        }
      } else {
        setTransactions(mockTransactions)
        localStorage.setItem(`transactions-${storageId}`, JSON.stringify(mockTransactions))
      }
      
      if (cachedDollarValues) {
        try {
          const parsedDollarValues = JSON.parse(cachedDollarValues)
          setDollarValues(parsedDollarValues)
          console.log('Valores del dólar cargados desde localStorage:', parsedDollarValues.length)
        } catch (e) {
          console.error('Error al parsear valores del dólar del localStorage:', e)
          setDollarValues(mockDollarValues)
          localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(mockDollarValues))
        }
      } else {
        setDollarValues(mockDollarValues)
        localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(mockDollarValues))
      }
    }

    loadInitialData()
  }, [storageId, isFirebaseEnabled, user])

  // Agregar una nueva transacción
  const addTransaction = async (transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">) => {
    try {
      if (isFirebaseEnabled && user) {
        // Guardar en Firebase
        const result = await transactionsService.addTransaction(transaction, user.uid)
        if (result.success) {
          const newTransaction: Transaction = {
            ...transaction,
            id: result.id!,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_id: user.uid
          }
          setTransactions(prev => [...prev, newTransaction])
          toast('Transacción agregada correctamente')
        } else {
          throw new Error(result.error)
        }
      } else {
        // Guardar localmente
        const newTransaction: Transaction = {
          ...transaction,
          id: Date.now().toString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'mock-user'
        }

        const updatedTransactions = [...transactions, newTransaction]
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions-${storageId}`, JSON.stringify(updatedTransactions))
        
        toast('Transacción agregada correctamente')
      }
    } catch (error) {
      console.error('Error al agregar transacción:', error)
      toast('Error al agregar la transacción')
      throw error
    }
  }

  // Actualizar una transacción existente
  const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
    try {
      if (isFirebaseEnabled && user) {
        // Actualizar en Firebase
        const result = await transactionsService.updateTransaction(id, transaction)
        if (result.success) {
          setTransactions(prev => prev.map(t => 
            t.id === id 
              ? { ...t, ...transaction, updated_at: new Date().toISOString() }
              : t
          ))
          toast('Transacción actualizada correctamente')
        } else {
          throw new Error(result.error)
        }
      } else {
        // Actualizar localmente
        const updatedTransactions = transactions.map((t) => 
          t.id === id 
            ? { ...t, ...transaction, updated_at: new Date().toISOString() }
            : t
        )
        
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions-${storageId}`, JSON.stringify(updatedTransactions))
        
        toast('Transacción actualizada correctamente')
      }
    } catch (error) {
      console.error('Error al actualizar transacción:', error)
      toast('Error al actualizar la transacción')
      throw error
    }
  }

  // Eliminar una transacción
  const deleteTransaction = async (id: string) => {
    try {
      if (isFirebaseEnabled && user) {
        // Eliminar de Firebase
        const result = await transactionsService.deleteTransaction(id)
        if (result.success) {
          setTransactions(prev => prev.filter(t => t.id !== id))
          toast('Transacción eliminada correctamente')
        } else {
          throw new Error(result.error)
        }
      } else {
        // Eliminar localmente
        const updatedTransactions = transactions.filter((t) => t.id !== id)
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions-${storageId}`, JSON.stringify(updatedTransactions))
        
        toast('Transacción eliminada correctamente')
      }
    } catch (error) {
      console.error('Error al eliminar transacción:', error)
      toast('Error al eliminar la transacción')
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
    try {
      const existingIndex = dollarValues.findIndex(d => d.month === month)
      let updatedDollarValues: DollarValue[]

      if (existingIndex >= 0) {
        // Actualizar existente
        updatedDollarValues = dollarValues.map((d, index) => 
          index === existingIndex 
            ? { ...d, value, updated_at: new Date().toISOString() }
            : d
        )
      } else {
        // Crear nuevo
        const newDollarValue: DollarValue = {
          id: Date.now().toString(),
          month,
          value,
          user_id: 'mock-user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        updatedDollarValues = [...dollarValues, newDollarValue]
      }

      setDollarValues(updatedDollarValues)
      localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(updatedDollarValues))
      
      toast('Valor del dólar actualizado correctamente')
    } catch (error) {
      console.error('Error al actualizar el valor del dólar:', error)
      toast('Error al actualizar el valor del dólar')
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
        isFirebaseEnabled,
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
