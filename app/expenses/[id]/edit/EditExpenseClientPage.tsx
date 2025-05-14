"use client"

import { ExpenseForm } from "../../expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

// Mock user data until we implement authentication
const currentUser = {
  id: "user-1",
  name: "John Doe",
}

export default function EditExpenseClientPage({
  expense,
  projects,
  jobs,
  params,
}: {
  expense: any
  projects: any[]
  jobs: any[]
  params: { id: string }
}) {
  // Mock users array until we implement authentication
  const users = [currentUser]

  async function handleUpdateExpense(formData: any) {
    "use server"

    // Update the expense
    // Assuming updateExpense is now an action passed from the server component
    redirect(`/expenses/${params.id}`)
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm expense={expense} projects={projects} jobs={jobs} users={users} onSubmit={handleUpdateExpense} />
        </CardContent>
      </Card>
    </div>
  )
}
