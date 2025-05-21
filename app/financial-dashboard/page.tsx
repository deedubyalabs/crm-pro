import { Suspense } from "react"
import type { Metadata } from "next"
import FinancialMetricsCards from "./financial-metrics-cards"
import RevenueExpensesChart from "./revenue-expenses-chart"
import TopProjectsTable from "./top-projects-table"
import OverdueInvoicesTable from "./overdue-invoices-table"
import InvoiceStatusChart from "./invoice-status-chart"
import PaymentMethodsChart from "./payment-methods-chart"
import ExpenseCategoriesChart from "./expense-categories-chart"
import DateRangeSelector from "./date-range-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Financial Dashboard | HomePro One",
  description: "Company-wide financial metrics and reporting",
}

export default async function FinancialDashboardPage({
  searchParams,
}: {
  searchParams: { startDate?: string; endDate?: string }
}) {
  const awaitedSearchParams = await searchParams;

  // Default to current year if no date range is provided
  const startDate = awaitedSearchParams.startDate || new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0] // Start of current year
  const endDate = awaitedSearchParams.endDate || new Date().toISOString().split("T")[0] // Current date

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <DateRangeSelector startDate={startDate} endDate={endDate} />
      </div>

      <Suspense fallback={<div>Loading financial metrics...</div>}>
        <FinancialMetricsCards startDate={startDate} endDate={endDate} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Expenses</CardTitle>
            <CardDescription>Monthly revenue and expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading chart...</div>}>
              <RevenueExpensesChart startDate={startDate} endDate={endDate} />
            </Suspense>
          </CardContent>
        </Card>

        <Tabs defaultValue="top-projects" className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <TabsList>
                <TabsTrigger value="top-projects">Top Projects</TabsTrigger>
                <TabsTrigger value="overdue-invoices">Overdue Invoices</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>Financial performance by project</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="top-projects" className="mt-0">
              <Suspense fallback={<div>Loading top projects...</div>}>
                <TopProjectsTable />
              </Suspense>
            </TabsContent>
            <TabsContent value="overdue-invoices" className="mt-0">
              <Suspense fallback={<div>Loading overdue invoices...</div>}>
                <OverdueInvoicesTable />
              </Suspense>
            </TabsContent>
          </CardContent>
        </Tabs>

        <Tabs defaultValue="invoice-status" className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Financial Breakdown</CardTitle>
              <TabsList>
                <TabsTrigger value="invoice-status">Invoices</TabsTrigger>
                <TabsTrigger value="payment-methods">Payments</TabsTrigger>
                <TabsTrigger value="expense-categories">Expenses</TabsTrigger>
              </TabsList>
            </div>
            <CardDescription>Breakdown of financial data by category</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="invoice-status" className="mt-0">
              <Suspense fallback={<div>Loading invoice status chart...</div>}>
                <InvoiceStatusChart startDate={startDate} endDate={endDate} />
              </Suspense>
            </TabsContent>
            <TabsContent value="payment-methods" className="mt-0">
              <Suspense fallback={<div>Loading payment methods chart...</div>}>
                <PaymentMethodsChart startDate={startDate} endDate={endDate} />
              </Suspense>
            </TabsContent>
            <TabsContent value="expense-categories" className="mt-0">
              <Suspense fallback={<div>Loading expense categories chart...</div>}>
                <ExpenseCategoriesChart startDate={startDate} endDate={endDate} />
              </Suspense>
            </TabsContent>
          </CardContent>
        </Tabs>
      </div>
    </div>
  )
}
