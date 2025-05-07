export type TransactionType = "ingreso" | "gasto"

export type TransactionCategory =
  | "salario"
  | "inversiones"
  | "otros_ingresos"
  | "alimentacion"
  | "transporte"
  | "vivienda"
  | "entretenimiento"
  | "salud"
  | "educacion"
  | "otros_gastos"

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: TransactionCategory
  date: string // formato: YYYY-MM
  notes?: string
  createdAt: number
}

export interface MonthSummary {
  month: string // formato: YYYY-MM
  income: number
  expense: number
  balance: number
}

export interface DollarValue {
  id: string
  month: string // formato: YYYY-MM
  value: number
  updatedAt: number
}
