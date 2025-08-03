"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useTransactions } from '@/context/transaction-context'

export function FirebaseSetupStatus() {
  // Ocultar completamente el componente de debug
  return null

  // Código original comentado para mantenerlo disponible si es necesario
  /*
  const { user, loading: authLoading } = useAuth()
  const { transactions, dollarValues, closedMonths, isLoading, isFirebaseEnabled } = useTransactions()
  const [localStorageData, setLocalStorageData] = useState<any>({})

  useEffect(() => {
    // Verificar datos en localStorage
    const checkLocalStorage = () => {
      const storageId = 'gastos-v2'
      const transactionsData = localStorage.getItem(`transactions-${storageId}`)
      const dollarValuesData = localStorage.getItem(`dollar-values-${storageId}`)
      const closedMonthsData = localStorage.getItem(`closed-months-${storageId}`)

      setLocalStorageData({
        transactions: transactionsData ? JSON.parse(transactionsData) : null,
        dollarValues: dollarValuesData ? JSON.parse(dollarValuesData) : null,
        closedMonths: closedMonthsData ? JSON.parse(closedMonthsData) : null
      })
    }

    checkLocalStorage()
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border max-w-md z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="text-xs space-y-1">
        <div>Firebase: {isFirebaseEnabled ? '✅ Configurado' : '❌ No configurado'}</div>
        <div>Auth Loading: {authLoading ? '⏳ Cargando' : '✅ Listo'}</div>
        <div>User: {user ? '✅ Autenticado' : '❌ Sin usuario'}</div>
        <div>Data Loading: {isLoading ? '⏳ Cargando' : '✅ Listo'}</div>
        <div>Transactions: {transactions.length}</div>
        <div>Dollar Values: {dollarValues.length}</div>
        <div>Closed Months: {closedMonths.length}</div>
        <div className="border-t pt-2 mt-2">
          <div className="font-semibold">LocalStorage:</div>
          <div>Transactions: {localStorageData.transactions ? localStorageData.transactions.length : 0}</div>
          <div>Dollar Values: {localStorageData.dollarValues ? localStorageData.dollarValues.length : 0}</div>
          <div>Closed Months: {localStorageData.closedMonths ? localStorageData.closedMonths.length : 0}</div>
        </div>
      </div>
    </div>
  )
  */
} 