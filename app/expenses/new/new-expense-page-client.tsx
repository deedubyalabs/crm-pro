"use client"

import { getProjects } from "@/lib/projects"
import { getJobs } from "@/lib/jobs"
import { createExpense } from "@/lib/expenses"
import { ExpenseForm } from "../expense-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

// Mock user data until we implement authentication
const currentUser = {
  id: "user-1",
  name: "John Doe",
}

export default function NewExpensePageClient() {
  const [projects, setProjects] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([currentUser])

  useEffect(() => {
    const fetchData = async () => {
      const projectsData = await getProjects()
      const jobsData = await getJobs()
      setProjects(projectsData)
      setJobs(jobsData)
    }

    fetchData()
  }, [])

  async function handleCreateExpense(formData: any) {
    "use server"

    // Set the current user ID
    formData.user_id = currentUser.id

    // Create the expense
    await createExpense(formData)

    redirect("/expenses")
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm projects={projects} jobs={jobs} users={users} onSubmit={handleCreateExpense} />
        </CardContent>
      </Card>
    </div>
  )
}
