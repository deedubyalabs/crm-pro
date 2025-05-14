import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getExpenseById } from "@/lib/expenses"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExpenseStatusBadge } from "../expense-status-badge"
import { ExpenseCategoryBadge } from "../expense-category-badge"
import { FileEdit, Receipt, ArrowLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Expense Details | HomePro One",
  description: "View expense details",
}

export default async function ExpenseDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const expense = await getExpenseById(params.id)

  if (!expense) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/expenses">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Expense Details</h1>
        </div>
        <div className="flex gap-2">
          {expense.receipt_url && (
            <Button variant="outline" asChild>
              <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                <Receipt className="mr-2 h-4 w-4" />
                View Receipt
              </a>
            </Button>
          )}
          <Button asChild>
            <Link href={`/expenses/${expense.id}/edit`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Expense Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">{expense.description}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <ExpenseCategoryBadge category={expense.category} />
                  <ExpenseStatusBadge status={expense.status} />
                  {expense.billable && <Badge variant="outline">Billable</Badge>}
                  {expense.reimbursable && <Badge variant="outline">Reimbursable</Badge>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-lg font-medium">{formatCurrency(expense.amount)}</p>
                </div>

                {expense.tax_amount !== null && (
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Amount</p>
                    <p className="text-lg font-medium">{formatCurrency(expense.tax_amount)}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-medium">{formatDate(expense.date)}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="text-lg font-medium">
                    {expense.payment_method
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
                  </p>
                </div>

                {expense.vendor && (
                  <div>
                    <p className="text-sm text-muted-foreground">Vendor</p>
                    <p className="text-lg font-medium">{expense.vendor}</p>
                  </div>
                )}

                {expense.status === "reimbursed" && expense.reimbursed_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Reimbursed Date</p>
                    <p className="text-lg font-medium">{formatDate(expense.reimbursed_date)}</p>
                  </div>
                )}
              </div>

              {expense.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1">{expense.notes}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Project</p>
                {expense.project ? (
                  <Link href={`/projects/${expense.project.id}`} className="text-lg font-medium hover:underline">
                    {expense.project.project_name}
                  </Link>
                ) : (
                  <p className="text-lg font-medium text-muted-foreground">No project assigned</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Job</p>
                {expense.job ? (
                  <Link href={`/jobs/${expense.job.id}`} className="text-lg font-medium hover:underline">
                    {expense.job.title}
                  </Link>
                ) : (
                  <p className="text-lg font-medium text-muted-foreground">No job assigned</p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Submitted By</p>
                <p className="text-lg font-medium">{expense.user.name}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-lg font-medium">{formatDate(expense.created_at)}</p>
              </div>

              {expense.updated_at !== expense.created_at && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-lg font-medium">{formatDate(expense.updated_at)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
