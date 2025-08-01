"use client"

import { useTransactions } from "@/context/transaction-context"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"

export function DebugDashboard() {
  const { 
    transactions, 
    dollarValues, 
    closedMonths, 
    isLoading, 
    isFirebaseEnabled 
  } = useTransactions()
  const { user, loading: authLoading } = useAuth()
  const [storageDebug, setStorageDebug] = useState<string>('Loading...')

  useEffect(() => {
    try {
      const debugValue = localStorage.getItem('transactions-gastos-v2')
      setStorageDebug(debugValue ? 'Found' : 'Not found')
    } catch (error) {
      setStorageDebug('Error')
    }
  }, [])

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Dashboard</h4>
      <div className="space-y-1">
        <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.uid : 'None'}</div>
        <div>Data Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Firebase Enabled: {isFirebaseEnabled ? 'Yes' : 'No'}</div>
        <div>Transactions: {transactions.length}</div>
        <div>Dollar Values: {dollarValues.length}</div>
        <div>Closed Months: {closedMonths.length}</div>
        <div>Storage: {storageDebug}</div>
      </div>
    </div>
  )
} 