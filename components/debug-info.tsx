"use client"

import { useAuth } from "@/hooks/use-auth"
import { useTransactions } from "@/context/transaction-context"

export function DebugInfo() {
  const { user, loading: authLoading } = useAuth()
  const { isLoading, transactions, isFirebaseEnabled, hasIndexErrors } = useTransactions()

  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-xs z-50">
      <h4 className="font-bold mb-2">Debug Info</h4>
      <div className="space-y-1">
        <div>Auth Loading: {authLoading ? 'Yes' : 'No'}</div>
        <div>User: {user ? user.uid : 'None'}</div>
        <div>Data Loading: {isLoading ? 'Yes' : 'No'}</div>
        <div>Transactions: {transactions.length}</div>
        <div>Firebase Enabled: {isFirebaseEnabled ? 'Yes' : 'No'}</div>
        <div>Index Errors: {hasIndexErrors ? 'Yes' : 'No'}</div>
      </div>
    </div>
  )
} 