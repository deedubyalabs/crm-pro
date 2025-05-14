import { getExpenses } from "@/lib/expenses"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, FileEdit, Receipt } from "lucide-react"
import Link from "next/link"
import { ExpenseStatusBadge } from "./expense-status-badge"
import { ExpenseCategoryBadge } from "./expense-category-badge"

interface ExpensesListProps {
  category?: string
  status?: string
  startDate?: string
  endDate?: string
  billable?: boolean
  reimbursable?: boolean
  projectId?: string
  jobId?: string
  limit?: number
}

export default async function ExpensesList({
  category,
  status,
  startDate,
  endDate,
  billable,
  reimbursable,
  projectId,
  jobId,
  limit,
}: ExpensesListProps) {
  const expenses = await getExpenses({
    category,
    status,
    startDate,
    endDate,
    billable,
    reimbursable,
    projectId,
    jobId,
    limit,
  })

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-6">
            <h3 className="text-lg font-medium">No expenses found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your filters or create a new expense.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate totals
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const billableAmount = expenses
    .filter((expense) => expense.billable)
    .reduce((sum, expense) => sum + expense.amount, 0)
  const reimbursableAmount = expenses
    .filter((expense) => expense.reimbursable)
    .reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <h3 className="text-2xl font-bold">{formatCurrency(totalAmount)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Billable Expenses</p>
              <h3 className="text-2xl font-bold">{formatCurrency(billableAmount)}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">Reimbursable Expenses</p>
              <h3 className="text-2xl font-bold">{formatCurrency(reimbursableAmount)}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{formatDate(expense.date)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">{expense.vendor || "No vendor"}</div>
                  </TableCell>
                  <TableCell>
                    <ExpenseCategoryBadge category={expense.category} />
                  </TableCell>
                  <TableCell>
                    {expense.project ? (
                      <Link href={`/projects/${expense.project.id}`} className="hover:underline">
                        {expense.project.project_name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">No project</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{formatCurrency(expense.amount)}</div>
                    <div className="flex gap-1 mt-1">
                      {expense.billable && <Badge variant="outline">Billable</Badge>}
                      {expense.reimbursable && <Badge variant="outline">Reimbursable</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <ExpenseStatusBadge status={expense.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {expense.receipt_url && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={expense.receipt_url} target="_blank" rel="noopener noreferrer">
                            <Receipt className="h-4 w-4" />
                            <span className="sr-only">View Receipt</span>
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expenses/${expense.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/expenses/${expense.id}/edit`}>
                          <FileEdit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
