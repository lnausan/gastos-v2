"use client"

import { useTheme } from "next-themes"
import {
  LineChart as RechartsLineChart,
  Line,
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

interface LineChartProps {
  data: MonthSummary[]
}

export default function LineChart({ data }: LineChartProps) {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  // Formatear los datos para el gráfico
  const chartData = data.map((item) => {
    const date = parse(item.month, "yyyy-MM", new Date())
    return {
      name: format(date, "MMM", { locale: es }),
      Saldo: item.balance,
    }
  })

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
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
            tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
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
          <Line type="monotone" dataKey="Saldo" stroke="#3B82F6" activeDot={{ r: 8 }} strokeWidth={2} />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
