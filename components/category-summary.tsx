"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/context/transaction-context"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface CategorySummaryProps {
  month: string
  type: "ingreso" | "gasto"
}

// Paleta elegante y oscura inspirada en la imagen del usuario
const ELEGANT_DARK_COLORS = [
  "#1e3a8a", // Azul oscuro (blue-900)
  "#065f46", // Verde bosque (emerald-900)
  "#7f1d1d", // Rojo vino (red-900)
  "#7c2d12", // Naranja quemado (orange-900)
  "#78350f", // Amarillo oscuro (amber-900)
  "#4b006e", // Violeta oscuro (custom)
  "#334155", // Slate oscuro (slate-800)
  "#0f172a", // Azul noche (slate-900)
  "#3f3f46", // Gris oscuro (zinc-800)
  "#27272a", // Gris muy oscuro (zinc-900)
]

export default function CategorySummary({ month, type }: CategorySummaryProps) {
  const { getMonthCategorySummary, getMonthSummary } = useTransactions()
  const { theme } = useTheme()
  const isDark = theme === "dark"

  const [categories, setCategories] = useState<{ id: string, name: string, color: string }[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClientComponentClient()
      const { data, error } = await supabase.from('categories').select('id, name, color')
      if (!error && data) setCategories(data)
    }
    fetchCategories()
  }, [])

  const categorySummary = getMonthCategorySummary(month, type)
  const monthSummary = getMonthSummary(month)
  const total = type === "ingreso" ? monthSummary.income : monthSummary.expense

  if (categorySummary.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{type === "ingreso" ? "Ingresos" : "Gastos"} por Categoría</CardTitle>
          <CardDescription>No hay datos para mostrar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No hay transacciones para mostrar en este período
          </div>
        </CardContent>
      </Card>
    )
  }

  // Preparar datos para el gráfico usando SIEMPRE la paleta elegante
  const chartData = categorySummary.map((item, idx) => {
    const cat = categories.find(c => c.id === item.category)
    return {
      name: cat?.name || item.category,
      value: item.amount,
      color: ELEGANT_DARK_COLORS[idx % ELEGANT_DARK_COLORS.length],
      category: item.category,
    }
  })

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type === "ingreso" ? "Ingresos" : "Gastos"} por Categoría</CardTitle>
        <CardDescription>Total: {total.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[420px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                contentStyle={{
                  backgroundColor: isDark ? "#333" : "#fff",
                  color: isDark ? "#fff" : "#333",
                  border: `1px solid ${isDark ? "#444" : "#ddd"}`,
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
