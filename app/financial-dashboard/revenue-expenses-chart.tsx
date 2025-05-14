"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { dashboardService } from "@/lib/dashboard-service"
import { formatCurrency } from "@/lib/utils"

export default function RevenueExpensesChart({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const metrics = await dashboardService.getCompanyFinancialMetrics({
          startDate,
          endDate,
        })

        // Combine revenue, expenses, and profit data
        const chartData = metrics.monthlyRevenue.map((item, index) => {
          const expenses = metrics.monthlyExpenses[index] || { value: 0 }
          const profit = metrics.monthlyProfit[index] || { value: 0 }

          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

          return {
            name: `${monthNames[item.month - 1]} ${item.year}`,
            revenue: item.value,
            expenses: expenses.value,
            profit: profit.value,
          }
        })

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
      <div className="flex items-center justify-center h-80">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
          <Tooltip formatter={(value: number) => formatCurrency(value)} labelFormatter={(label) => `Month: ${label}`} />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" />
          <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
          <Bar dataKey="profit" name="Profit" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
