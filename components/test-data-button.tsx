"use client"

import { Button } from "@/components/ui/button"

export function TestDataButton() {
  const addTestData = () => {
    const testTransactions = [
      {
        id: "1",
        description: "Test Transaction 1",
        amount: 1000,
        type: "ingreso" as const,
        category: "Salario",
        date: "2024-01-15",
        month: "2024-01",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user"
      },
      {
        id: "2",
        description: "Test Transaction 2",
        amount: 500,
        type: "gasto" as const,
        category: "Comida",
        date: "2024-01-16",
        month: "2024-01",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user"
      }
    ]

    const testDollarValues = [
      {
        id: "1",
        month: "2024-01",
        value: 35.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: "test-user"
      }
    ]

    localStorage.setItem('transactions-gastos-v2', JSON.stringify(testTransactions))
    localStorage.setItem('dollar-values-gastos-v2', JSON.stringify(testDollarValues))
    
    console.log('Datos de prueba agregados')
    window.location.reload()
  }

  return (
    <Button onClick={addTestData} className="fixed bottom-4 right-4 z-50">
      Agregar Datos de Prueba
    </Button>
  )
} 