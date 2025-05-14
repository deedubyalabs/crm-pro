import { dashboardService } from "@/lib/dashboard-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Receipt, BarChart2 } from "lucide-react"

export default async function FinancialMetricsCards({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const metrics = await dashboardService.getCompanyFinancialMetrics({
    startDate,
    endDate,
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.formattedMetrics.totalPaid}</div>
          <p className="text-xs text-muted-foreground">
            From {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Receipt className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.formattedMetrics.totalExpenses}</div>
          <p className="text-xs text-muted-foreground">
            From {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit</CardTitle>
          {metrics.profit >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.profit < 0 ? "text-red-500" : ""}`}>
            {metrics.formattedMetrics.profit}
          </div>
          <p className="text-xs text-muted-foreground">Profit Margin: {metrics.formattedMetrics.profitMargin}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
          <BarChart2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.formattedMetrics.totalInvoiced}</div>
          <p className="text-xs text-muted-foreground">
            {Object.entries(metrics.invoiceStatusCounts)
              .map(([status, count]) => `${status}: ${count}`)
              .join(", ")}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.formattedMetrics.outstandingBalance}</div>
          <p className="text-xs text-muted-foreground">
            {((metrics.outstandingBalance / metrics.totalInvoiced) * 100).toFixed(1)}% of invoiced amount
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalInvoiced > 0 ? `${((metrics.totalPaid / metrics.totalInvoiced) * 100).toFixed(1)}%` : "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.formattedMetrics.totalPaid} collected of {metrics.formattedMetrics.totalInvoiced} invoiced
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
