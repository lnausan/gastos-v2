"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useId } from "react"
import type { Transaction, MonthSummary, DollarValue, ClosedMonth } from "@/types/transaction"
import { toast } from 'sonner'
import { useAuth } from '@/hooks/use-auth'
import { transactionsService } from '@/lib/transactions'

interface TransactionContextType {
  transactions: Transaction[]
  dollarValues: DollarValue[]
  closedMonths: ClosedMonth[]
  addTransaction: (transaction: Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">) => Promise<void>
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getMonthTransactions: (month: string, includeArchived: boolean) => Transaction[]
  getMonthSummary: (month: string) => MonthSummary
  getLastSixMonthsSummary: () => MonthSummary[]
  getAllMonthsSummary: () => MonthSummary[]
  getDollarValue: (month: string) => DollarValue | undefined
  updateDollarValue: (month: string, value: number) => Promise<void>
  getMonthCategorySummary: (month: string, type: "ingreso" | "gasto") => { category: string; amount: number }[]
  closeMonth: (month: string, carryOverAmount?: number) => Promise<{ success: boolean; message: string; nextMonth: string }>
  loadNextMonthTransactions: (nextMonth: string, carryOverAmount?: number) => Promise<void>
  getClosedMonths: () => ClosedMonth[]
  refreshMonthTransactions: (month: string) => Promise<void>
  cleanupDuplicateClosedMonths: () => void
  isLoading: boolean
  isFirebaseEnabled: boolean
  hasIndexErrors: boolean
  clearAllData: () => void
  retryFirebaseConnection: () => void
  forceLoadHistoricalData: () => Promise<void>
  loadHistoricalDataImmediately: () => void
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dollarValues, setDollarValues] = useState<DollarValue[]>([])
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFirebaseEnabled, setIsFirebaseEnabled] = useState(false)
  const [hasIndexErrors, setHasIndexErrors] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const storageId = 'gastos-v2' // ID fijo para localStorage
  const { user, loading: authLoading } = useAuth()

  // Verificar si Firebase está configurado
  useEffect(() => {
    const checkFirebaseConfig = () => {
      // Verificar si las variables de entorno están disponibles
      const hasConfig = !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      )
      
      setIsFirebaseEnabled(hasConfig)
      // console.log('Firebase configurado:', { hasConfig, isEnabled: hasConfig })
    }
    
    checkFirebaseConfig()
  }, [])

  // Cargar datos iniciales
  useEffect(() => {
    // console.log('TransactionProvider useEffect ejecutándose:', {
    //   authLoading,
    //   dataLoaded,
    //   isFirebaseEnabled,
    //   user: user ? 'Usuario presente' : 'Sin usuario'
    // })
    
    // Solo cargar datos cuando la autenticación haya terminado y no se hayan cargado ya
    if (authLoading || dataLoaded) {
      // console.log('Saltando carga de datos:', { authLoading, dataLoaded })
      return
    }

    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        // console.log('Iniciando carga de datos...')
        
        // Si no hay usuario autenticado, cargar datos locales directamente
        if (!user) {
          // console.log('No hay usuario autenticado, cargando datos locales...')
          loadLocalData()
          setDataLoaded(true)
          setIsLoading(false)
          return
        }
        
        if (isFirebaseEnabled && user) {
          // console.log('Cargando datos desde Firebase...', { userId: user.uid })
          
          let firebaseError = false
          
          try {
            // Cargar desde Firebase
            const transactionsResult = await transactionsService.getTransactions(user.uid)
            // console.log('Resultado de transacciones:', transactionsResult)
            
            const dollarValuesResult = await transactionsService.getDollarValues(user.uid)
            // console.log('Resultado de valores del dólar:', dollarValuesResult)
            
            const closedMonthsResult = await transactionsService.getClosedMonths(user.uid)
            // console.log('Resultado de meses cerrados:', closedMonthsResult)
            
            if (transactionsResult.success) {
              setTransactions(transactionsResult.transactions || [])
              // console.log('Transacciones de Firebase cargadas:', transactionsResult.transactions?.length || 0)
            } else {
              console.error('Error al cargar transacciones:', transactionsResult.error)
              if (transactionsResult.error && transactionsResult.error.includes('index')) {
                setHasIndexErrors(true)
              }
              if (transactionsResult.error && transactionsResult.error.includes('permissions')) {
                firebaseError = true
              }
            }

            if (dollarValuesResult.success) {
              setDollarValues(dollarValuesResult.dollarValues || [])
              // console.log('Valores del dólar de Firebase cargados:', dollarValuesResult.dollarValues?.length || 0)
            } else {
              console.error('Error al cargar valores del dólar:', dollarValuesResult.error)
              if (dollarValuesResult.error && dollarValuesResult.error.includes('index')) {
                setHasIndexErrors(true)
              }
              if (dollarValuesResult.error && dollarValuesResult.error.includes('permissions')) {
                firebaseError = true
              }
            }

            if (closedMonthsResult.success) {
              const cleanedClosedMonths = cleanDuplicateClosedMonths(closedMonthsResult.closedMonths || [])
              setClosedMonths(cleanedClosedMonths)
              // console.log('Meses cerrados de Firebase cargados:', cleanedClosedMonths.length)
            } else {
              console.error('Error al cargar meses cerrados:', closedMonthsResult.error)
              if (closedMonthsResult.error && closedMonthsResult.error.includes('permissions')) {
                firebaseError = true
              }
            }
            
            // Si hubo errores de permisos, cargar datos locales como fallback
            if (firebaseError) {
              // console.log('Error de permisos detectado, cargando datos locales como fallback')
              loadLocalData()
            }
            
          } catch (error) {
            console.error('Error al cargar datos de Firebase:', error)
            firebaseError = true
            loadLocalData()
          }
        } else {
          // console.log('Cargando datos locales...', { isFirebaseEnabled, hasUser: !!user })
          // Cargar datos locales
          loadLocalData()
        }
        
        // console.log('Datos cargados correctamente')
        setDataLoaded(true)
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
        loadLocalData()
        setDataLoaded(true)
        toast('Error al cargar los datos iniciales')
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [storageId, isFirebaseEnabled, user, authLoading, dataLoaded])

  // Timeout para forzar carga de datos si la autenticación tarda demasiado
  useEffect(() => {
    if (authLoading && !dataLoaded) {
      const timeoutId = setTimeout(() => {
        // console.log('Timeout: Forzando carga de datos locales después de 5 segundos')
        if (!dataLoaded) {
          loadLocalData()
          setDataLoaded(true)
          setIsLoading(false)
        }
      }, 5000) // 5 segundos

      return () => clearTimeout(timeoutId)
    }
  }, [authLoading, dataLoaded])

  // Timeout adicional más agresivo para asegurar que se carguen datos
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // console.log('Timeout agresivo: Forzando carga de datos después de 10 segundos')
      if (!dataLoaded) {
        loadLocalData()
        setDataLoaded(true)
        setIsLoading(false)
      }
    }, 10000) // 10 segundos

    return () => clearTimeout(timeoutId)
  }, [dataLoaded])

  // Resetear dataLoaded cuando cambie el usuario
  useEffect(() => {
    setDataLoaded(false)
  }, [user])

  // Función para forzar la carga de datos históricos
  const forceLoadHistoricalData = async () => {
    try {
      setIsLoading(true)
      // console.log('Forzando carga de datos históricos...')
      
      if (user && isFirebaseEnabled) {
        // Intentar cargar desde Firebase
        const transactionsResult = await transactionsService.getTransactions(user.uid)
        const dollarValuesResult = await transactionsService.getDollarValues(user.uid)
        const closedMonthsResult = await transactionsService.getClosedMonths(user.uid)
        
        if (transactionsResult.success) {
          setTransactions(transactionsResult.transactions || [])
          // console.log('Transacciones históricas cargadas:', transactionsResult.transactions?.length || 0)
        }
        
        if (dollarValuesResult.success) {
          setDollarValues(dollarValuesResult.dollarValues || [])
          // console.log('Valores del dólar históricos cargados:', dollarValuesResult.dollarValues?.length || 0)
        }
        
        if (closedMonthsResult.success) {
          const cleanedClosedMonths = cleanDuplicateClosedMonths(closedMonthsResult.closedMonths || [])
          setClosedMonths(cleanedClosedMonths)
          // console.log('Meses cerrados históricos cargados:', cleanedClosedMonths.length)
        }
        
        toast.success('Datos históricos cargados desde Firebase')
      } else {
        // Si no hay usuario o Firebase no está disponible, agregar datos históricos de muestra
        addHistoricalData()
        toast.success('Datos históricos de muestra agregados')
      }
    } catch (error) {
      console.error('Error al cargar datos históricos:', error)
      toast.error('Error al cargar datos históricos')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar datos históricos inmediatamente
  const loadHistoricalDataImmediately = () => {
    // console.log('Cargando datos históricos inmediatamente...')
    addHistoricalData()
    toast.success('Datos históricos cargados inmediatamente')
  }

  const loadLocalData = () => {
    try {
      // console.log('Cargando datos desde localStorage con storageId:', storageId)
      
      // Cargar transacciones desde localStorage
      const storedTransactions = localStorage.getItem(`transactions-${storageId}`)
      if (storedTransactions) {
        const parsedTransactions = JSON.parse(storedTransactions)
        setTransactions(parsedTransactions)
        // console.log('Transacciones locales cargadas:', parsedTransactions.length)
      } else {
        // console.log('No se encontraron transacciones en localStorage')
        // Agregar datos de prueba automáticamente
        addSampleData()
      }

      // Cargar valores del dólar desde localStorage
      const storedDollarValues = localStorage.getItem(`dollar-values-${storageId}`)
      if (storedDollarValues) {
        const parsedDollarValues = JSON.parse(storedDollarValues)
        setDollarValues(parsedDollarValues)
        // console.log('Valores del dólar locales cargados:', parsedDollarValues.length)
      } else {
        // console.log('No se encontraron valores del dólar en localStorage')
      }

      // Cargar meses cerrados desde localStorage
      const storedClosedMonths = localStorage.getItem(`closed-months-${storageId}`)
      if (storedClosedMonths) {
        const parsedClosedMonths = JSON.parse(storedClosedMonths)
        const cleanedClosedMonths = cleanDuplicateClosedMonths(parsedClosedMonths)
        setClosedMonths(cleanedClosedMonths)
        // console.log('Meses cerrados locales cargados:', cleanedClosedMonths.length)
      } else {
        // console.log('No se encontraron meses cerrados en localStorage')
      }
    } catch (error) {
      console.error('Error al cargar datos locales:', error)
    }
  }

  const addSampleData = () => {
    // Obtener el mes actual
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonthName = now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    
    const sampleTransactions = [
      {
        id: '1',
        amount: 100000,
        type: 'ingreso' as const,
        category_id: 'salario',
        date: `${currentMonth}-15`,
        description: `Salario ${currentMonthName}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local-user',
        archived: false
      },
      {
        id: '2',
        amount: 25000,
        type: 'gasto' as const,
        category_id: 'comida',
        date: `${currentMonth}-20`,
        description: 'Supermercado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local-user',
        archived: false
      },
      {
        id: '3',
        amount: 15000,
        type: 'gasto' as const,
        category_id: 'transporte',
        date: `${currentMonth}-22`,
        description: 'Combustible',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local-user',
        archived: false
      },
      {
        id: '4',
        amount: 50000,
        type: 'ingreso' as const,
        category_id: 'freelance',
        date: `${currentMonth}-25`,
        description: 'Proyecto freelance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local-user',
        archived: false
      }
    ]

    const sampleDollarValues = [
      {
        id: '1',
        month: currentMonth,
        value: 1000,
        user_id: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        month: `${now.getFullYear()}-${String(now.getMonth() + 2).padStart(2, '0')}`,
        value: 1050,
        user_id: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]

    setTransactions(sampleTransactions)
    setDollarValues(sampleDollarValues)
    
    // Guardar en localStorage
    localStorage.setItem(`transactions-${storageId}`, JSON.stringify(sampleTransactions))
    localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(sampleDollarValues))
    
    // console.log('Datos de muestra agregados automáticamente para el mes actual:', currentMonth)
    toast.success(`Datos de muestra cargados para ${currentMonthName}`)
  }

  const addHistoricalData = () => {
    // Generar datos históricos para los últimos 6 meses
    const now = new Date()
    const historicalTransactions = []
    const historicalDollarValues = []
    
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
      const monthName = monthDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
      
      // Agregar transacciones para cada mes
      historicalTransactions.push(
        {
          id: `hist-${month}-1`,
          amount: 80000 + Math.floor(Math.random() * 40000),
          type: 'ingreso' as const,
          category_id: 'salario',
          date: `${month}-15`,
          description: `Salario ${monthName}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'local-user',
          archived: false
        },
        {
          id: `hist-${month}-2`,
          amount: 20000 + Math.floor(Math.random() * 15000),
          type: 'gasto' as const,
          category_id: 'comida',
          date: `${month}-20`,
          description: 'Supermercado',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'local-user',
          archived: false
        },
        {
          id: `hist-${month}-3`,
          amount: 10000 + Math.floor(Math.random() * 10000),
          type: 'gasto' as const,
          category_id: 'transporte',
          date: `${month}-22`,
          description: 'Combustible',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'local-user',
          archived: false
        }
      )
      
      // Agregar valor del dólar para cada mes
      historicalDollarValues.push({
        id: `dollar-${month}`,
        month: month,
        value: 950 + Math.floor(Math.random() * 100),
        user_id: 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    }
    
    // Combinar con datos actuales
    const allTransactions = [...transactions, ...historicalTransactions]
    const allDollarValues = [...dollarValues, ...historicalDollarValues]
    
    setTransactions(allTransactions)
    setDollarValues(allDollarValues)
    
    // Guardar en localStorage
    localStorage.setItem(`transactions-${storageId}`, JSON.stringify(allTransactions))
    localStorage.setItem(`dollar-values-${storageId}`, JSON.stringify(allDollarValues))
    
    // console.log('Datos históricos agregados:', historicalTransactions.length, 'transacciones')
    toast.success(`Datos históricos agregados: ${historicalTransactions.length} transacciones`)
  }

  const clearAllData = () => {
    setTransactions([])
    setDollarValues([])
    setClosedMonths([])
    setDataLoaded(false)
    localStorage.removeItem(`transactions-${storageId}`)
    localStorage.removeItem(`dollar-values-${storageId}`)
    localStorage.removeItem(`closed-months-${storageId}`)
    toast.success("Sesión cerrada y datos limpiados.")
  }

  // Función para limpiar meses cerrados duplicados
  const cleanDuplicateClosedMonths = (months: ClosedMonth[]): ClosedMonth[] => {
    const seen = new Set<string>()
    return months.filter(month => {
      if (seen.has(month.month)) {
        return false
      }
      seen.add(month.month)
      return true
    })
  }

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
  const getMonthTransactions = (month: string, includeArchived: boolean = false) => {
    return transactions.filter((t) => {
      const isInMonth = t.date.startsWith(month)
      return includeArchived ? isInMonth : (isInMonth && !t.archived)
    })
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
    
    // Calcular USDT (suma de todas las transacciones con categoría "usdt")
    const usdt = monthTransactions
      .filter((t) => t.category_id === 'usdt')
      .reduce((sum, t) => sum + t.amount, 0)
    
    // Calcular CEDEARS (suma de todas las transacciones con categoría "cedears")
    const cedears = monthTransactions
      .filter((t) => t.category_id === 'cedears')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month,
      income,
      expense,
      balance: income - expense,
      usdt,
      cedears,
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
      
      const usdt = monthTransactions
        .filter(t => t.category_id === 'usdt')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      
      const cedears = monthTransactions
        .filter(t => t.category_id === 'cedears')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        month,
        income,
        expense,
        balance: income - expense,
        usdt,
        cedears
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
      if (isFirebaseEnabled && user) {
        // Guardar en Firebase
        const result = await transactionsService.upsertDollarValue({ month, value }, user.uid)
        if (result.success) {
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
              id: result.id!,
              month,
              value,
              user_id: user.uid,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            updatedDollarValues = [...dollarValues, newDollarValue]
          }

          setDollarValues(updatedDollarValues)
          toast('Valor del dólar actualizado correctamente')
        } else {
          throw new Error(result.error)
        }
      } else {
        // Guardar localmente
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
      }
    } catch (error) {
      console.error('Error al actualizar el valor del dólar:', error)
      toast('Error al actualizar el valor del dólar')
      throw error
    }
  }

  const retryFirebaseConnection = async () => {
    setIsLoading(true)
    setHasIndexErrors(false)
    setDataLoaded(false)
    
    try {
      if (isFirebaseEnabled && user) {
        // Reintentar cargar datos desde Firebase
        const transactionsResult = await transactionsService.getTransactions(user.uid)
        const dollarValuesResult = await transactionsService.getDollarValues(user.uid)
        
        if (transactionsResult.success && dollarValuesResult.success) {
          setTransactions(transactionsResult.transactions || [])
          setDollarValues(dollarValuesResult.dollarValues || [])
          setDataLoaded(true)
          toast('Conexión con Firebase restaurada correctamente')
        } else {
          // Si aún hay errores de índices, mantener el estado
          if ((transactionsResult.error && transactionsResult.error.includes('index')) ||
              (dollarValuesResult.error && dollarValuesResult.error.includes('index'))) {
            setHasIndexErrors(true)
            toast('Los índices aún están siendo creados. Intenta de nuevo en unos minutos.')
          } else {
            toast('Error al conectar con Firebase')
          }
        }
      }
    } catch (error) {
      console.error('Error al reintentar conexión:', error)
      toast('Error al reintentar conexión con Firebase')
    } finally {
      setIsLoading(false)
    }
  }

  // Cerrar el mes actual y generar resumen
  const closeMonth = async (month: string, carryOverAmount?: number): Promise<{ success: boolean; message: string; nextMonth: string }> => {
    try {
      // Verificar si el mes ya está cerrado
      const isAlreadyClosed = closedMonths.some(cm => cm.month === month)
      if (isAlreadyClosed) {
        return {
          success: false,
          message: `El mes ${month} ya está cerrado`,
          nextMonth: ''
        }
      }

      const monthSummary = getMonthSummary(month)
      const monthTransactions = getMonthTransactions(month)
      
      if (monthTransactions.length === 0) {
        return {
          success: false,
          message: 'No hay transacciones para cerrar este mes',
          nextMonth: ''
        }
      }

      // Calcular el próximo mes
      const [year, monthNum] = month.split('-')
      const nextMonthDate = new Date(parseInt(year), parseInt(monthNum) - 1 + 1, 1)
      const nextMonth = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, '0')}`

      if (isFirebaseEnabled && user) {
        // Archivar transacciones en Firebase
        const archiveResult = await transactionsService.archiveMonthTransactions(user.uid, month)
        if (!archiveResult.success) {
          throw new Error(archiveResult.error)
        }

        // Guardar el resumen del mes cerrado
        const closedMonthData = {
          month,
          income: monthSummary.income,
          expense: monthSummary.expense,
          balance: monthSummary.balance,
          transaction_count: monthTransactions.length,
          closed_at: new Date().toISOString(),
          carry_over_amount: carryOverAmount,
          usdt: monthSummary.usdt,
          cedears: monthSummary.cedears
        }

        const saveResult = await transactionsService.saveClosedMonth(closedMonthData, user.uid)
        if (!saveResult.success) {
          throw new Error(saveResult.error)
        }

        // Actualizar estado local
        setTransactions(prev => prev.map(t => 
          t.date.startsWith(month) ? { ...t, archived: true } : t
        ))

        const newClosedMonth: ClosedMonth = {
          id: saveResult.id!,
          ...closedMonthData,
          user_id: user.uid
        }
        setClosedMonths(prev => [newClosedMonth, ...prev])
      } else {
        // Archivar localmente
        const updatedTransactions = transactions.map(t => 
          t.date.startsWith(month) ? { ...t, archived: true } : t
        )
        setTransactions(updatedTransactions)
        localStorage.setItem(`transactions-${storageId}`, JSON.stringify(updatedTransactions))

        // Guardar mes cerrado localmente
        const newClosedMonth: ClosedMonth = {
          id: Date.now().toString(),
          month,
          income: monthSummary.income,
          expense: monthSummary.expense,
          balance: monthSummary.balance,
          transaction_count: monthTransactions.length,
          closed_at: new Date().toISOString(),
          user_id: 'mock-user',
          carry_over_amount: carryOverAmount,
          usdt: monthSummary.usdt,
          cedears: monthSummary.cedears
        }
        
        // Actualizar estado y localStorage con el nuevo estado
        setClosedMonths(prev => {
          const updatedClosedMonths = [newClosedMonth, ...prev]
          localStorage.setItem(`closed-months-${storageId}`, JSON.stringify(updatedClosedMonths))
          return updatedClosedMonths
        })
      }

      // Si se especifica un monto para llevar al próximo mes, crear una transacción de ingreso inicial
      if (carryOverAmount && carryOverAmount > 0) {
        const initialTransaction = {
          amount: carryOverAmount,
          type: 'ingreso' as const,
          category_id: 'finanzas',
          date: `${nextMonth}-01`,
          description: 'Saldo inicial del mes anterior'
        }

        try {
          await addTransaction(initialTransaction)
          toast.success(`Saldo inicial de $${carryOverAmount.toLocaleString('es-AR')} cargado para ${nextMonth}`)
        } catch (error) {
          console.error('Error al crear transacción de saldo inicial:', error)
          toast.error('Error al crear transacción de saldo inicial')
        }
      }

      const message = `Mes ${month} cerrado exitosamente. 
        Ingresos: $${monthSummary.income.toLocaleString('es-AR')} 
        Gastos: $${monthSummary.expense.toLocaleString('es-AR')} 
        Balance: $${monthSummary.balance.toLocaleString('es-AR')}
        Transacciones archivadas: ${monthTransactions.length}`

      toast.success('Mes cerrado exitosamente')
      
      return {
        success: true,
        message,
        nextMonth
      }
    } catch (error) {
      console.error('Error al cerrar el mes:', error)
      toast('Error al cerrar el mes')
      return {
        success: false,
        message: 'Error al cerrar el mes',
        nextMonth: ''
      }
    }
  }

  // Cargar transacciones del próximo mes (opcionalmente con saldo inicial)
  const loadNextMonthTransactions = async (nextMonth: string, carryOverAmount?: number): Promise<void> => {
    try {
      // Si se especifica un monto para llevar al próximo mes, crear una transacción de ingreso inicial
      if (carryOverAmount && carryOverAmount > 0) {
        const initialTransaction = {
          amount: carryOverAmount,
          type: 'ingreso' as const,
          category_id: 'finanzas',
          date: `${nextMonth}-01`,
          description: 'Saldo inicial del mes anterior'
        }

        await addTransaction(initialTransaction)
        toast(`Saldo inicial de $${carryOverAmount.toLocaleString('es-AR')} cargado para ${nextMonth}`)
      }

      toast(`Listo para cargar transacciones de ${nextMonth}`)
    } catch (error) {
      console.error('Error al cargar transacciones del próximo mes:', error)
      toast('Error al cargar transacciones del próximo mes')
    }
  }

  // Obtener meses cerrados
  const getClosedMonths = (): ClosedMonth[] => {
    return closedMonths
  }

  // Forzar actualización de transacciones para un mes específico
  const refreshMonthTransactions = async (month: string) => {
    try {
      if (isFirebaseEnabled && user) {
        // Recargar transacciones desde Firebase para el mes específico
        const result = await transactionsService.getTransactions(user.uid)
        if (result.success) {
          setTransactions(result.transactions || [])
        }
      }
    } catch (error) {
      console.error('Error al actualizar transacciones del mes:', error)
    }
  }

  const cleanupDuplicateClosedMonths = () => {
    setClosedMonths(cleanDuplicateClosedMonths(closedMonths))
  }

  const value = {
    transactions,
    dollarValues,
    closedMonths,
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
    closeMonth,
    loadNextMonthTransactions,
    getClosedMonths,
    cleanupDuplicateClosedMonths,
    isLoading,
    isFirebaseEnabled,
    hasIndexErrors,
    clearAllData,
    retryFirebaseConnection,
    refreshMonthTransactions,
    forceLoadHistoricalData,
    loadHistoricalDataImmediately,
  }

  return (
    <TransactionContext.Provider value={value}>
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
