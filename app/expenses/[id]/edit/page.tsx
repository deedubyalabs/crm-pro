import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getExpenseById } from "@/lib/expenses"
import { getProjects } from "@/lib/projects"
import { getJobs } from "@/lib/jobs"
import EditExpenseClientPage from "./EditExpenseClientPage"

export const metadata: Metadata = {
  title: "Edit Expense | HomePro One",
  description: "Edit an existing expense",
}

export default async function EditExpensePage({
  params,
}: {
  params: { id: string }
}) {
  const expense = await getExpenseById(params.id)

  if (!expense) {
    notFound()
  }

  const projects = await getProjects()
  const jobs = await getJobs()

  return <EditExpenseClientPage expense={expense} projects={projects} jobs={jobs} params={params} />
}
