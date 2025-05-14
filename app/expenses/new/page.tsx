import type { Metadata } from "next"
import NewExpensePageClient from "./new-expense-page-client"

export const metadata: Metadata = {
  title: "New Expense | HomePro One",
  description: "Create a new expense",
}

export default async function NewExpensePage() {
  return <NewExpensePageClient />
}
