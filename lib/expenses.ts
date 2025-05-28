import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "./supabase"
import { projectService } from "./projects"
import { projectFinancialLogService } from "./project-financial-log"
import type {
  Expense,
  ExpenseWithDetails,
  NewExpense,
  ExpenseUpdate,
} from "@/types/expenses"

export const expenseService = {
  /**
   * Get all expenses with optional filtering
   */
  async getExpenses(
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
        created_by:created_by_user_id (
          id,
          first_name,
          last_name,
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
      query = query.eq("created_by_user_id", options.userId)
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
  },

  /**
   * Get expense by ID
   */
  async getExpenseById(id: string): Promise<ExpenseWithDetails | null> {
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
        created_by:created_by_user_id (
          id,
          first_name,
          last_name,
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
  },

  /**
   * Create a new expense
   */
  async createExpense(expense: NewExpense): Promise<Expense> {
    const { data, error } = await supabase
      .from("expenses")
      .insert(expense as NewExpense)
      .select()
      .single()

    if (error) {
      console.error("Error creating expense:", error)
      throw new Error(`Failed to create expense: ${error.message}`)
    }

    // If the expense is linked to a project, update the project's actual_cost
    if (data.project_id && data.amount) {
      await projectService.updateProjectActualCost(data.project_id, data.amount);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: data.project_id,
        transaction_type: "Expense Logged",
        transaction_id: data.id,
        amount_impact: data.amount,
        description: `Expense: ${data.description || "N/A"}`,
        created_by_user_id: data.created_by_user_id,
        new_actual_cost: null,
        new_budget_amount: null
      });
    }

    return data as Expense
  },

  /**
   * Update an expense
   */
  async updateExpense(id: string, updates: ExpenseUpdate): Promise<Expense> {
    // Fetch the old expense data to calculate the difference in amount
    const oldExpense = await this.getExpenseById(id);
    if (!oldExpense) {
      throw new Error(`Expense with ID ${id} not found.`);
    }

    const { data, error } = await supabase
      .from("expenses")
      .update(updates as ExpenseUpdate)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating expense:", error)
      throw new Error(`Failed to update expense: ${error.message}`)
    }

    // If the expense is linked to a project and the amount has changed, update the project's actual_cost
    if (data.project_id && data.amount !== oldExpense.amount) {
      const amountDifference = data.amount - oldExpense.amount;
      await projectService.updateProjectActualCost(data.project_id, amountDifference);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: data.project_id,
        transaction_type: "Expense Updated",
        transaction_id: data.id,
        amount_impact: amountDifference,
        description: `Expense updated: ${data.description || "N/A"}`,
        created_by_user_id: data.created_by_user_id,
        new_actual_cost: null,
        new_budget_amount: null
      });
    }

    return data as Expense
  },

  /**
   * Delete an expense
   */
  async deleteExpense(id: string): Promise<void> {
    // Fetch the expense data before deleting to reverse its impact on project cost
    const expenseToDelete = await this.getExpenseById(id);
    if (!expenseToDelete) {
      throw new Error(`Expense with ID ${id} not found.`);
    }

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) {
      console.error("Error deleting expense:", error)
      throw new Error(`Failed to delete expense: ${error.message}`)
    }

    // If the deleted expense was linked to a project, reverse its impact on the project's actual_cost
    if (expenseToDelete.project_id && expenseToDelete.amount) {
      await projectService.updateProjectActualCost(expenseToDelete.project_id, -expenseToDelete.amount);
      await projectFinancialLogService.addProjectFinancialLog({
        project_id: expenseToDelete.project_id,
        transaction_type: "Expense Deleted",
        transaction_id: expenseToDelete.id,
        amount_impact: -expenseToDelete.amount,
        description: `Expense deleted: ${expenseToDelete.description || "N/A"}`,
        created_by_user_id: expenseToDelete.created_by_user_id,
        new_actual_cost: null,
        new_budget_amount: null
      });
    }
  },

  /**
   * Get expense statistics
   */
  async getExpenseStatistics(
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
    const expenses = await this.getExpenses({ // Use this.getExpenses
      projectId: options.projectId,
      startDate: options.startDate,
      endDate: options.endDate,
    })

    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const categoryCounts: Record<string, number> = {}
    const categoryAmounts: Record<string, number> = {}

    expenses.forEach((expense) => {
      // Count by category
      if (expense.category) {
        categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1
      }

      // Sum amounts by category
      if (expense.category) {
        categoryAmounts[expense.category] = (categoryAmounts[expense.category] || 0) + expense.amount
      }
    })

    return {
      totalAmount,
      categoryCounts,
      categoryAmounts,
    }
  },

  /**
   * Get billable expenses for a project
   */
  async getBillableExpensesByProject(projectId: string, billed: boolean = false): Promise<ExpenseWithDetails[]> {
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
        created_by:created_by_user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq("project_id", projectId)
      .eq("billable", true)
      .eq("billed", billed)
      .order("expense_date", { ascending: false })

    if (error) {
      console.error("Error fetching billable expenses:", error)
      throw new Error(`Failed to fetch billable expenses: ${error.message}`)
    }

    return data as unknown as ExpenseWithDetails[]
  },

  /**
   * Upload expense receipt
   */
  async uploadExpenseReceipt(file: File): Promise<string> {
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
  },
}
