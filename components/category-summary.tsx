"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTransactions } from "@/context/transaction-context"
import { useTheme } from "next-themes"

interface CategorySummaryProps {
  month: string
  type: "ingreso" | "gasto"
}

const CATEGORY_COLORS: Record<string, string> = {
  // Ingresos
  salario: "#10B981",
  inversiones: "#059669",
  otros_ingresos: "#047857",

  // Gastos
  alimentacion: "#EF4444",
  transporte: "#DC2626",
  vivienda: "#B91C1C",
  entretenimiento: "#991B1B",
  salud: "#7F1D1D",
  educacion: "#F97316",
  otros_gastos: "#C2410C",
}

const CATEGORY_LABELS: Record<string, string> = {
  salario: "Salario",
  inversiones: "Inversiones",
  otros_ingresos: "Otros ingresos",
  alimentacion: "Alimentación",
  transporte: "Transporte",
  vivienda: "Vivienda",
  entretenimiento: "Entretenimiento",
  salud: "Salud",
  educacion: "Educación",
  otros_gastos: "Otros gastos",
}

export default function CategorySummary({ month, type }: CategorySummaryProps) {
  const { getMonthCategorySummary, getMonthSummary } = useTransactions()
  const { theme } = useTheme()
  const isDark = theme === "dark"

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

  // Preparar datos para el gráfico
  const chartData = categorySummary.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    value: item.amount,
    category: item.category,
  }))

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
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || "#8884d8"}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => value.toFixed(2)}
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
