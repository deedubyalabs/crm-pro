"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  FileText,
  ClipboardList,
  CreditCard,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react"
import { financialService } from "@/lib/financial-service"
import { formatCurrency, formatDate } from "@/lib/utils"

export default function FinancialDashboard({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [financialData, setFinancialData] = useState<any>(null)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        const data = await financialService.getProjectFinancialSummary(projectId)
        setFinancialData(data)
      } catch (error) {
        console.error("Error fetching financial data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [projectId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!financialData) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Error Loading Financial Data</h3>
        <p className="text-muted-foreground mt-2">Unable to load financial information for this project.</p>
      </div>
    )
  }

  const {
    projectName,
    estimateTotal,
    changeOrdersTotal,
    contractTotal,
    invoicedTotal,
    paidTotal,
    outstandingBalance,
    expensesTotal,
    profit,
    profitMargin,
    estimate,
    changeOrders,
    invoices,
    payments,
    expenses,
  } = financialData

  // Calculate percentages for progress bars
  const invoicedPercentage = contractTotal > 0 ? (invoicedTotal / contractTotal) * 100 : 0
  const paidPercentage = invoicedTotal > 0 ? (paidTotal / invoicedTotal) * 100 : 0
  const profitPercentage = Math.max(0, Math.min(100, profitMargin)) // Clamp between 0-100

  // Get counts of items by status
  const pendingInvoices = invoices.filter((inv: any) => inv.status === "Draft" || inv.status === "Sent").length
  const overdueInvoices = invoices.filter((inv: any) => inv.status === "Overdue").length
  const pendingChangeOrders = changeOrders.filter((co: any) => co.status === "Pending").length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Dashboard</h2>
          <p className="text-muted-foreground">Financial overview for {projectName}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild>
            <Link href={`/projects/${projectId}/invoices/generate`}>
              <FileText className="mr-2 h-4 w-4" />
              Generate Invoice
            </Link>
          </Button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(contractTotal)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Base: {formatCurrency(estimateTotal)} + Change Orders: {formatCurrency(changeOrdersTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Invoiced Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(invoicedTotal)}</div>
            <Progress value={invoicedPercentage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {invoicedPercentage.toFixed(0)}% of contract value invoiced
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Collected Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(paidTotal)}</div>
            <Progress value={paidPercentage} className="h-2 mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {paidPercentage.toFixed(0)}% of invoiced amount collected
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(outstandingBalance)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {invoices.filter((inv: any) => inv.status === "Overdue").length} overdue invoice(s)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit & Expenses */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profit & Loss</CardTitle>
            <CardDescription>Current financial performance of this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Revenue (Collected)</span>
                <span>{formatCurrency(paidTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Expenses</span>
                <span>{formatCurrency(expensesTotal)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="font-medium">Profit</span>
                <span className={profit >= 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                  {formatCurrency(profit)}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Profit Margin</span>
                  <span className={profitMargin >= 0 ? "text-green-600" : "text-red-600"}>
                    {profitMargin.toFixed(1)}%
                  </span>
                </div>
                <Progress value={profitPercentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Action Items</CardTitle>
            <CardDescription>Items requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvoices > 0 && (
                <div className="flex items-start space-x-2">
                  <FileText className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{pendingInvoices} pending invoice(s)</p>
                    <p className="text-sm text-muted-foreground">Draft or sent invoices awaiting payment</p>
                  </div>
                </div>
              )}

              {overdueInvoices > 0 && (
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{overdueInvoices} overdue invoice(s)</p>
                    <p className="text-sm text-muted-foreground">Invoices past their due date</p>
                  </div>
                </div>
              )}

              {pendingChangeOrders > 0 && (
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-medium">{pendingChangeOrders} pending change order(s)</p>
                    <p className="text-sm text-muted-foreground">Change orders awaiting approval</p>
                  </div>
                </div>
              )}

              {pendingInvoices === 0 && overdueInvoices === 0 && pendingChangeOrders === 0 && (
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">All items up to date</p>
                    <p className="text-sm text-muted-foreground">No pending financial items</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/projects/${projectId}/invoices/generate`}>
                <FileText className="mr-2 h-4 w-4" />
                Generate Invoice
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Detailed Financial Information */}
      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="invoices"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Invoices
          </TabsTrigger>
          <TabsTrigger
            value="payments"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger
            value="change-orders"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Change Orders
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Expenses
          </TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>All invoices for this project</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${projectId}/invoices/generate`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Invoice
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any) => {
                      const balance = invoice.total_amount - (invoice.amount_paid || 0)
                      let statusBadge

                      switch (invoice.status) {
                        case "Draft":
                          statusBadge = <Badge variant="outline">Draft</Badge>
                          break
                        case "Sent":
                          statusBadge = <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>
                          break
                        case "Partially Paid":
                          statusBadge = (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Partially Paid</Badge>
                          )
                          break
                        case "Paid":
                          statusBadge = <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>
                          break
                        case "Overdue":
                          statusBadge = <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>
                          break
                        case "Void":
                          statusBadge = <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Void</Badge>
                          break
                        default:
                          statusBadge = <Badge variant="outline">{invoice.status}</Badge>
                      }

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link href={`/invoices/${invoice.id}`} className="font-medium hover:underline">
                              {invoice.invoice_number}
                            </Link>
                          </TableCell>
                          <TableCell>{formatDate(invoice.issue_date)}</TableCell>
                          <TableCell>{formatDate(invoice.due_date)}</TableCell>
                          <TableCell>{statusBadge}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(invoice.amount_paid || 0)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(balance)}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/invoices/${invoice.id}`}>View</Link>
                              </Button>
                              {balance > 0 && (
                                <Button asChild size="sm">
                                  <Link href={`/invoices/${invoice.id}/record-payment`}>
                                    <CreditCard className="mr-1 h-3 w-3" />
                                    Pay
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Invoices</h3>
                  <p className="text-muted-foreground mt-2 mb-6">No invoices have been created for this project yet.</p>
                  <Button asChild>
                    <Link href={`/projects/${projectId}/invoices/generate`}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Generate Invoice
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>All payments received for this project</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment: any) => {
                      const relatedInvoice = invoices.find((inv: any) => inv.id === payment.invoice_id)

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.payment_date)}</TableCell>
                          <TableCell>
                            {relatedInvoice ? (
                              <Link href={`/invoices/${relatedInvoice.id}`} className="hover:underline">
                                {relatedInvoice.invoice_number}
                              </Link>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                          <TableCell>{payment.reference_number || "-"}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(payment.amount)}</TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline">
                              View Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Payments</h3>
                  <p className="text-muted-foreground mt-2">No payments have been recorded for this project yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Change Orders Tab */}
        <TabsContent value="change-orders" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Change Orders</CardTitle>
                <CardDescription>All change orders for this project</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${projectId}/change-orders/new`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Change Order
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {changeOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>CO #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Cost Impact</TableHead>
                      <TableHead className="text-right">Time Impact</TableHead>
                      <TableHead>Billed</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changeOrders.map((co: any) => {
                      let statusBadge

                      switch (co.status) {
                        case "Requested":
                          statusBadge = <Badge variant="outline">Requested</Badge>
                          break
                        case "Pending":
                          statusBadge = (
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                          )
                          break
                        case "Approved":
                          statusBadge = (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
                          )
                          break
                        case "Rejected":
                          statusBadge = <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
                          break
                        case "Completed":
                          statusBadge = <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>
                          break
                        default:
                          statusBadge = <Badge variant="outline">{co.status}</Badge>
                      }

                      return (
                        <TableRow key={co.id}>
                          <TableCell>
                            <Link href={`/change-orders/${co.id}`} className="font-medium hover:underline">
                              {co.co_number}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">{co.description}</TableCell>
                          <TableCell>{statusBadge}</TableCell>
                          <TableCell className="text-right">{formatCurrency(co.cost_impact)}</TableCell>
                          <TableCell className="text-right">{co.time_impact_days} days</TableCell>
                          <TableCell>{co.billed ? "Yes" : "No"}</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/change-orders/${co.id}`}>View</Link>
                              </Button>
                              {co.status === "Approved" && !co.billed && (
                                <Button asChild size="sm">
                                  <Link href={`/projects/${projectId}/invoices/generate?changeOrderId=${co.id}`}>
                                    <FileText className="mr-1 h-3 w-3" />
                                    Invoice
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Change Orders</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    No change orders have been created for this project yet.
                  </p>
                  <Button asChild>
                    <Link href={`/projects/${projectId}/change-orders/new`}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Create Change Order
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expenses</CardTitle>
                <CardDescription>All expenses for this project</CardDescription>
              </div>
              <Button asChild>
                <Link href={`/projects/${projectId}/expenses/new`}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Expense
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {expenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Billable</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense: any) => (
                      <TableRow key={expense.id}>
                        <TableCell>{formatDate(expense.expense_date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{expense.description}</TableCell>
                        <TableCell>{expense.category || "Uncategorized"}</TableCell>
                        <TableCell>
                          {expense.billable ? (
                            expense.billed ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Billed</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Billable</Badge>
                            )
                          ) : (
                            <Badge variant="outline">Non-Billable</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/expenses/${expense.id}`}>View</Link>
                            </Button>
                            {expense.billable && !expense.billed && (
                              <Button asChild size="sm">
                                <Link href={`/projects/${projectId}/invoices/generate?expenseId=${expense.id}`}>
                                  <FileText className="mr-1 h-3 w-3" />
                                  Invoice
                                </Link>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Expenses</h3>
                  <p className="text-muted-foreground mt-2 mb-6">
                    No expenses have been recorded for this project yet.
                  </p>
                  <Button asChild>
                    <Link href={`/projects/${projectId}/expenses/new`}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Record Expense
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
