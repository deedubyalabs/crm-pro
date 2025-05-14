import { Suspense } from "react"
import type { Metadata } from "next"
import ExpensesList from "./expenses-list"
import ExpenseFilters from "./expense-filters"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Expenses | HomePro One",
  description: "Manage and track your business expenses",
}

export default function ExpensesPage({
  searchParams,
}: {
  searchParams: {
    category?: string
    status?: string
    startDate?: string
    endDate?: string
    billable?: string
    reimbursable?: string
  }
}) {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Expenses</h1>
        <Link href="/expenses/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Expense
          </Button>
        </Link>
      </div>

      <ExpenseFilters
        selectedCategory={searchParams.category}
        selectedStatus={searchParams.status}
        startDate={searchParams.startDate}
        endDate={searchParams.endDate}
        billable={searchParams.billable === "true"}
        reimbursable={searchParams.reimbursable === "true"}
      />

      <Suspense fallback={<div>Loading expenses...</div>}>
        <ExpensesList
          category={searchParams.category}
          status={searchParams.status}
          startDate={searchParams.startDate}
          endDate={searchParams.endDate}
          billable={searchParams.billable === "true" ? true : undefined}
          reimbursable={searchParams.reimbursable === "true" ? true : undefined}
        />
      </Suspense>
    </div>
  )
}
