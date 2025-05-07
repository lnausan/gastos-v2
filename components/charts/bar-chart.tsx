"use client"

import { useTheme } from "next-themes"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { MonthSummary } from "@/types/transaction"
import { format, parse } from "date-fns"
import { es } from "date-fns/locale"

interface BarChartProps {
  data: MonthSummary[]
}

export default function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Formatear los datos para el gráfico
  const chartData = data.map((item) => {
    const date = parse(item.month, "yyyy-MM", new Date())
    return {
      name: format(date, "MMM yyyy", { locale: es }),
      Ingresos: item.income,
      Gastos: item.expense,
    }
  })

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#333" : "#eee"} />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "#ccc" : "#333" }}
            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1, 3)}
          />
          <YAxis tick={{ fill: isDark ? "#ccc" : "#333" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? "#333" : "#fff",
              color: isDark ? "#fff" : "#333",
              border: `1px solid ${isDark ? "#444" : "#ddd"}`,
            }}
          />
          <Legend />
          <Bar dataKey="Ingresos" fill="#10B981" />
          <Bar dataKey="Gastos" fill="#EF4444" />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
