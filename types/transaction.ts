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
  archived?: boolean // Indica si la transacción está archivada (mes cerrado)
}

export interface MonthSummary {
  month: string // formato: YYYY-MM
  income: number
  expense: number
  balance: number
  usdt: number // Total de transacciones con categoría USDT
  cedears: number // Total de transacciones con categoría CEDEARS
}

export interface DollarValue {
  id: string
  month: string // formato: YYYY-MM
  value: number
  user_id: string
  created_at: string
  updated_at: string
}

export interface ClosedMonth {
  id: string
  month: string // formato: YYYY-MM
  income: number
  expense: number
  balance: number
  transaction_count: number
  closed_at: string
  user_id: string
  carry_over_amount?: number // Monto llevado al próximo mes
  usdt?: number // Total de transacciones con categoría USDT
  cedears?: number // Total de transacciones con categoría CEDEARS
}
