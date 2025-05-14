"use client"

import { useEffect, useState } from "react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { dashboardService } from "@/lib/dashboard-service"
import { formatCurrency } from "@/lib/utils"

export default function PaymentMethodsChart({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const metrics = await dashboardService.getCompanyFinancialMetrics({
          startDate,
          endDate,
        })

        // Format payment method data for pie chart
        const chartData = Object.entries(metrics.paymentMethodDistribution).map(([method, amount], index) => ({
          name: method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          value: amount,
        }))

        setData(chartData)
      } catch (err) {
        console.error("Error fetching chart data:", err)
        setError("Failed to load chart data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrency(value)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
