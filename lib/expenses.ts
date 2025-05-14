import { createClient } from "@/lib/supabase"
import type {
  Expense,
  ExpenseWithDetails,
  NewExpense,
  ExpenseUpdate,
  ExpenseInsert,
  ExpenseUpdate_DB,
} from "@/types/expenses"

/**
 * Get all expenses with optional filtering
 */
export async function getExpenses(
  options: {
    projectId?: string
    jobId?: string
    userId?: string
    category?: string
    status?: string
    startDate?: string
    endDate?: string
    billable?: boolean
    reimbursable?: boolean
    limit?: number
    offset?: number
  } = {},
): Promise<ExpenseWithDetails[]> {
  const supabase = createClient()

  let query = supabase
    .from("expenses")
    .select(`
      *,
      project:project_id (
        id,
        project_name
      ),
      job:job_id (
        id,
        title
      ),
      user:user_id (
        id,
        name,
        email
      )
    `)
    .order("date", { ascending: false })

  // Apply filters
  if (options.projectId) {
    query = query.eq("project_id", options.projectId)
  }

  if (options.jobId) {
    query = query.eq("job_id", options.jobId)
  }

  if (options.userId) {
    query = query.eq("user_id", options.userId)
  }

  if (options.category) {
    query = query.eq("category", options.category)
  }

  if (options.status) {
    query = query.eq("status", options.status)
  }

  if (options.startDate) {
    query = query.gte("date", options.startDate)
  }

  if (options.endDate) {
    query = query.lte("date", options.endDate)
  }

  if (options.billable !== undefined) {
    query = query.eq("billable", options.billable)
  }

  if (options.reimbursable !== undefined) {
    query = query.eq("reimbursable", options.reimbursable)
  }

  // Apply pagination
  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching expenses:", error)
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  return data as unknown as ExpenseWithDetails[]
}

/**
 * Get expense by ID
 */
export async function getExpenseById(id: string): Promise<ExpenseWithDetails | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .select(`
      *,
      project:project_id (
        id,
        project_name
      ),
      job:job_id (
        id,
        title
      ),
      user:user_id (
        id,
        name,
        email
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Expense not found
    }
    console.error("Error fetching expense:", error)
    throw new Error(`Failed to fetch expense: ${error.message}`)
  }

  return data as unknown as ExpenseWithDetails
}

/**
 * Create a new expense
 */
export async function createExpense(expense: NewExpense): Promise<Expense> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .insert(expense as ExpenseInsert)
    .select()
    .single()

  if (error) {
    console.error("Error creating expense:", error)
    throw new Error(`Failed to create expense: ${error.message}`)
  }

  return data as Expense
}

/**
 * Update an expense
 */
export async function updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("expenses")
    .update(updates as ExpenseUpdate_DB)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating expense:", error)
    throw new Error(`Failed to update expense: ${error.message}`)
  }

  return data as Expense
}

/**
 * Delete an expense
 */
export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    console.error("Error deleting expense:", error)
    throw new Error(`Failed to delete expense: ${error.message}`)
  }
}

/**
 * Get expense statistics
 */
export async function getExpenseStatistics(
  options: {
    projectId?: string
    startDate?: string
    endDate?: string
  } = {},
): Promise<{
  totalAmount: number
  categoryCounts: Record<string, number>
  categoryAmounts: Record<string, number>
}> {
  const expenses = await getExpenses({
    projectId: options.projectId,
    startDate: options.startDate,
    endDate: options.endDate,
  })

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  const categoryCounts: Record<string, number> = {}
  const categoryAmounts: Record<string, number> = {}

  expenses.forEach((expense) => {
    // Count by category
    categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1

    // Sum amounts by category
    categoryAmounts[expense.category] = (categoryAmounts[expense.category] || 0) + expense.amount
  })

  return {
    totalAmount,
    categoryCounts,
    categoryAmounts,
  }
}

/**
 * Upload expense receipt
 */
export async function uploadExpenseReceipt(file: File): Promise<string> {
  const supabase = createClient()

  const fileExt = file.name.split(".").pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
  const filePath = `expense-receipts/${fileName}`

  const { data, error } = await supabase.storage.from("receipts").upload(filePath, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading receipt:", error)
    throw new Error(`Failed to upload receipt: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(filePath)

  return urlData.publicUrl
}
