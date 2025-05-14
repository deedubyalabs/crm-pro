import { supabase, handleSupabaseError } from "./supabase"
import { formatCurrency } from "./utils"
import { financialService } from "./financial-service"

export const dashboardService = {
  /**
   * Get company-wide financial metrics
   */
  async getCompanyFinancialMetrics(
    dateRange: { startDate: string; endDate: string } = {
      startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of current year
      endDate: new Date().toISOString(), // Current date
    },
  ) {
    try {
      const { startDate, endDate } = dateRange

      // Get all invoices in the date range
      const { data: invoices, error: invoicesError } = await supabase
        .from("invoices")
        .select("*")
        .gte("issue_date", startDate)
        .lte("issue_date", endDate)

      if (invoicesError) throw invoicesError

      // Get all payments in the date range
      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .gte("payment_date", startDate)
        .lte("payment_date", endDate)

      if (paymentsError) throw paymentsError

      // Get all expenses in the date range
      const { data: expenses, error: expensesError } = await supabase
        .from("expenses")
        .select("*")
        .gte("expense_date", startDate)
        .lte("expense_date", endDate)

      if (expensesError) throw expensesError

      // Calculate metrics
      const totalInvoiced = invoices ? invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) : 0
      const totalPaid = payments ? payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0
      const totalExpenses = expenses ? expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0
      const profit = totalPaid - totalExpenses
      const profitMargin = totalPaid > 0 ? (profit / totalPaid) * 100 : 0
      const outstandingBalance = totalInvoiced - totalPaid

      // Get invoice counts by status
      const invoiceStatusCounts = invoices
        ? invoices.reduce(
            (acc, inv) => {
              const status = inv.status || "Unknown"
              acc[status] = (acc[status] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get invoice amounts by status
      const invoiceStatusAmounts = invoices
        ? invoices.reduce(
            (acc, inv) => {
              const status = inv.status || "Unknown"
              acc[status] = (acc[status] || 0) + (inv.total_amount || 0)
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get invoice counts by type
      const invoiceTypeCounts = invoices
        ? invoices.reduce(
            (acc, inv) => {
              const type = inv.invoice_type || "standard"
              acc[type] = (acc[type] || 0) + 1
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get invoice amounts by type
      const invoiceTypeAmounts = invoices
        ? invoices.reduce(
            (acc, inv) => {
              const type = inv.invoice_type || "standard"
              acc[type] = (acc[type] || 0) + (inv.total_amount || 0)
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get payment methods distribution
      const paymentMethodDistribution = payments
        ? payments.reduce(
            (acc, payment) => {
              const method = payment.payment_method || "Unknown"
              acc[method] = (acc[method] || 0) + (payment.amount || 0)
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get expense categories distribution
      const expenseCategoryDistribution = expenses
        ? expenses.reduce(
            (acc, expense) => {
              const category = expense.category || "Uncategorized"
              acc[category] = (acc[category] || 0) + (expense.amount || 0)
              return acc
            },
            {} as Record<string, number>,
          )
        : {}

      // Get monthly revenue data
      const monthlyRevenue = this.calculateMonthlyData(payments, "payment_date", "amount", startDate, endDate)

      // Get monthly expenses data
      const monthlyExpenses = this.calculateMonthlyData(expenses, "expense_date", "amount", startDate, endDate)

      // Get monthly profit data
      const monthlyProfit = monthlyRevenue.map((revenue, index) => {
        const expense = monthlyExpenses[index] || { month: revenue.month, year: revenue.year, value: 0 }
        return {
          month: revenue.month,
          year: revenue.year,
          value: revenue.value - expense.value,
        }
      })

      return {
        totalInvoiced,
        totalPaid,
        totalExpenses,
        profit,
        profitMargin,
        outstandingBalance,
        invoiceStatusCounts,
        invoiceStatusAmounts,
        invoiceTypeCounts,
        invoiceTypeAmounts,
        paymentMethodDistribution,
        expenseCategoryDistribution,
        monthlyRevenue,
        monthlyExpenses,
        monthlyProfit,
        formattedMetrics: {
          totalInvoiced: formatCurrency(totalInvoiced),
          totalPaid: formatCurrency(totalPaid),
          totalExpenses: formatCurrency(totalExpenses),
          profit: formatCurrency(profit),
          profitMargin: `${profitMargin.toFixed(2)}%`,
          outstandingBalance: formatCurrency(outstandingBalance),
        },
      }
    } catch (error) {
      console.error("Error getting company financial metrics:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Get top performing projects by revenue
   */
  async getTopPerformingProjects(limit = 5) {
    try {
      // Get all projects with their invoices and payments
      const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, project_name, project_number, person_id, estimate_id")

      if (projectsError) throw projectsError

      // Calculate financial metrics for each project
      const projectMetrics = await Promise.all(
        projects.map(async (project) => {
          try {
            const summary = await financialService.getProjectFinancialSummary(project.id)
            return {
              id: project.id,
              projectName: project.project_name,
              projectNumber: project.project_number,
              revenue: summary.paidTotal,
              expenses: summary.expensesTotal,
              profit: summary.profit,
              profitMargin: summary.profitMargin,
            }
          } catch (error) {
            console.error(`Error getting financial summary for project ${project.id}:`, error)
            return {
              id: project.id,
              projectName: project.project_name,
              projectNumber: project.project_number,
              revenue: 0,
              expenses: 0,
              profit: 0,
              profitMargin: 0,
            }
          }
        }),
      )

      // Sort projects by revenue and return the top ones
      return projectMetrics.sort((a, b) => b.revenue - a.revenue).slice(0, limit)
    } catch (error) {
      console.error("Error getting top performing projects:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Get overdue invoices
   */
  async getOverdueInvoices() {
    try {
      const today = new Date().toISOString()

      // Get all overdue invoices
      const { data: overdueInvoices, error } = await supabase
        .from("invoices")
        .select(
          `
          *,
          project:projects(project_name),
          person:people(first_name, last_name, business_name)
        `,
        )
        .lt("due_date", today)
        .not("status", "eq", "Paid")
        .not("status", "eq", "Void")
        .order("due_date")

      if (error) throw error

      // Calculate days overdue for each invoice
      return (overdueInvoices || []).map((invoice) => {
        const dueDate = new Date(invoice.due_date)
        const currentDate = new Date()
        const diffTime = Math.abs(currentDate.getTime() - dueDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        return {
          ...invoice,
          daysOverdue: diffDays,
          amountDue: invoice.total_amount - (invoice.amount_paid || 0),
        }
      })
    } catch (error) {
      console.error("Error getting overdue invoices:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Calculate monthly data for charts
   */
  calculateMonthlyData(
    data: any[],
    dateField: string,
    valueField: string,
    startDate: string,
    endDate: string,
  ): { month: number; year: number; value: number }[] {
    // Create a map to store monthly totals
    const monthlyMap = new Map<string, number>()

    // Initialize the map with all months in the date range
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start)

    while (current <= end) {
      const year = current.getFullYear()
      const month = current.getMonth() + 1 // JavaScript months are 0-indexed
      const key = `${year}-${month}`
      monthlyMap.set(key, 0)
      current.setMonth(current.getMonth() + 1)
    }

    // Sum values by month
    if (data && data.length > 0) {
      data.forEach((item) => {
        if (item[dateField] && item[valueField]) {
          const date = new Date(item[dateField])
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const key = `${year}-${month}`

          if (monthlyMap.has(key)) {
            monthlyMap.set(key, (monthlyMap.get(key) || 0) + (item[valueField] || 0))
          }
        }
      })
    }

    // Convert map to array format for charts
    const result: { month: number; year: number; value: number }[] = []
    monthlyMap.forEach((value, key) => {
      const [year, month] = key.split("-").map(Number)
      result.push({ month, year, value })
    })

    // Sort by year and month
    return result.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year
      }
      return a.month - b.month
    })
  },
}
