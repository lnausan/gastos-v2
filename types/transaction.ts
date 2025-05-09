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

export type TransactionType = "ingreso" | "gasto"

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category_id: string
  date: string
  description: string | null
  created_at: string
  updated_at: string
  user_id: string
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
  created_at: string
  updated_at: string
}
