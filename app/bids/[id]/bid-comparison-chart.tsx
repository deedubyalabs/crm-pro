"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"
import { formatCurrency } from "@/lib/utils"
import type { BidRequestWithDetails, BidComparisonResult } from "@/types/bidding"

Chart.register(...registerables)

interface BidComparisonChartProps {
  bidRequest: BidRequestWithDetails
  bidComparison: BidComparisonResult
}

export function BidComparisonChart({ bidRequest, bidComparison }: BidComparisonChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Prepare data
    const labels = bidRequest.responses.map(
      (response) =>
        response.subcontractor.business_name ||
        `${response.subcontractor.first_name} ${response.subcontractor.last_name}`,
    )

    const bidAmounts = bidRequest.responses.map((response) => response.total_amount)

    // Create chart
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Bid Amount",
            data: bidAmounts,
            backgroundColor: bidAmounts.map((amount) =>
              amount > bidComparison.totalEstimatedCost ? "rgba(239, 68, 68, 0.5)" : "rgba(34, 197, 94, 0.5)",
            ),
            borderColor: bidAmounts.map((amount) =>
              amount > bidComparison.totalEstimatedCost ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)",
            ),
            borderWidth: 1,
          },
          {
            label: "Estimated Cost",
            data: Array(labels.length).fill(bidComparison.totalEstimatedCost),
            type: "line",
            borderColor: "rgba(107, 114, 128, 0.8)",
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatCurrency(value as number),
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || ""
                const value = context.parsed.y
                return `${label}: ${formatCurrency(value)}`
              },
              footer: (tooltipItems) => {
                const index = tooltipItems[0].dataIndex
                const bidAmount = bidAmounts[index]
                const variance = bidAmount - bidComparison.totalEstimatedCost
                const variancePercentage = (variance / bidComparison.totalEstimatedCost) * 100

                return [`Variance: ${formatCurrency(variance)}`, `Percentage: ${variancePercentage.toFixed(2)}%`]
              },
            },
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [bidRequest, bidComparison])

  return <canvas ref={chartRef} />
}
