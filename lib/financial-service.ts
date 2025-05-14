import { supabase, handleSupabaseError } from "./supabase"
import { projectService } from "./projects"
import { estimateService } from "./estimates"
import { createInvoice, updateInvoice, getInvoiceById } from "./invoices"
import { expenseService } from "./expenses"
import { timeEntryService } from "./time-entries"
import { paymentService } from "./payments"
import type { InvoiceLineItem, InvoiceType } from "@/types/invoices"
import type { CreatePaymentParams } from "@/types/payments"

/**
 * Financial Service - Central hub for all financial operations
 * Handles the integration between estimates, change orders, invoices, expenses, and payments
 */
export const financialService = {
  /**
   * Generate an invoice from a project's approved estimate
   */
  async generateInvoiceFromEstimate(
    projectId: string,
    options: {
      includeAllItems?: boolean
      specificItems?: string[]
      depositPercentage?: number
      dueDate?: string
      notes?: string
    } = {},
  ): Promise<string | null> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the estimate linked to the project
      if (!project.estimate_id) {
        throw new Error("No estimate linked to this project")
      }

      const estimate = await estimateService.getEstimateById(project.estimate_id)
      if (!estimate) {
        throw new Error("Estimate not found")
      }

      if (estimate.status !== "Accepted") {
        throw new Error("Cannot generate invoice from an estimate that hasn't been accepted")
      }

      // Prepare invoice line items
      const lineItems: Partial<InvoiceLineItem>[] = []
      let totalAmount = 0
      let invoiceType: InvoiceType = "standard"

      if (options.depositPercentage && options.depositPercentage > 0) {
        // Create a deposit invoice
        invoiceType = "deposit"
        const depositAmount = (estimate.total_amount * options.depositPercentage) / 100

        // Add a section header
        lineItems.push({
          description: `Deposit for Estimate #${estimate.estimate_number}`,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: 0,
          is_section_header: true,
          section_title: `Deposit for Estimate #${estimate.estimate_number}`,
          source_type: "estimate",
          source_id: estimate.id,
        })

        // Add the deposit line item
        lineItems.push({
          description: `Deposit (${options.depositPercentage}% of total estimate)`,
          quantity: 1,
          unit: "each",
          unit_price: depositAmount,
          total: depositAmount,
          sort_order: 1,
          is_section_header: false,
          source_type: "estimate",
          source_id: estimate.id,
        })
        totalAmount = depositAmount
      } else if (options.includeAllItems) {
        // Include all estimate line items
        invoiceType = "standard"

        // Add a section header
        lineItems.push({
          description: `Estimate #${estimate.estimate_number}`,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: 0,
          is_section_header: true,
          section_title: `Estimate #${estimate.estimate_number}`,
          source_type: "estimate",
          source_id: estimate.id,
        })

        // Add all line items
        estimate.line_items.forEach((item, index) => {
          lineItems.push({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            total: item.total,
            sort_order: index + 1,
            is_section_header: false,
            source_type: "estimate_line_item",
            source_id: item.id,
          })
        })
        totalAmount = estimate.total_amount
      } else if (options.specificItems && options.specificItems.length > 0) {
        // Include only specific line items
        invoiceType = "standard"

        // Add a section header
        lineItems.push({
          description: `Partial Invoice for Estimate #${estimate.estimate_number}`,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: 0,
          is_section_header: true,
          section_title: `Partial Invoice for Estimate #${estimate.estimate_number}`,
          source_type: "estimate",
          source_id: estimate.id,
        })

        const itemsMap = new Map(estimate.line_items.map((item) => [item.id, item]))
        let sortOrder = 1

        options.specificItems
          .filter((id) => itemsMap.has(id))
          .forEach((id) => {
            const item = itemsMap.get(id)!
            lineItems.push({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              total: item.total,
              sort_order: sortOrder++,
              is_section_header: false,
              source_type: "estimate_line_item",
              source_id: item.id,
            })
            totalAmount += item.total
          })
      } else {
        // Default: create a full invoice
        invoiceType = "standard"

        // Add a section header
        lineItems.push({
          description: `Estimate #${estimate.estimate_number}`,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: 0,
          is_section_header: true,
          section_title: `Estimate #${estimate.estimate_number}`,
          source_type: "estimate",
          source_id: estimate.id,
        })

        // Add all line items
        estimate.line_items.forEach((item, index) => {
          lineItems.push({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            total: item.total,
            sort_order: index + 1,
            is_section_header: false,
            source_type: "estimate_line_item",
            source_id: item.id,
          })
        })
        totalAmount = estimate.total_amount
      }

      // Create the invoice
      const invoiceId = await createInvoice({
        project_id: projectId,
        person_id: project.person_id,
        invoice_number: "", // Will be generated
        status: "Draft",
        invoice_type: invoiceType,
        issue_date: new Date().toISOString(),
        due_date: options.dueDate,
        total_amount: totalAmount,
        amount_paid: 0,
        notes: options.notes || `Invoice generated from Estimate #${estimate.estimate_number}`,
        line_items: lineItems,
      })

      return invoiceId
    } catch (error) {
      console.error("Error generating invoice from estimate:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Generate an invoice from approved change orders
   */
  async generateInvoiceFromChangeOrders(
    projectId: string,
    changeOrderIds: string[],
    options: {
      dueDate?: string
      notes?: string
    } = {},
  ): Promise<string | null> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the change orders
      const { data: changeOrders, error } = await supabase
        .from("change_orders")
        .select("*")
        .eq("project_id", projectId)
        .in("id", changeOrderIds)
        .eq("status", "Approved")

      if (error) throw error
      if (!changeOrders || changeOrders.length === 0) {
        throw new Error("No approved change orders found with the provided IDs")
      }

      // Get line items for each change order
      const lineItemPromises = changeOrders.map(async (co) => {
        const { data: lineItems, error: lineItemsError } = await supabase
          .from("change_order_line_items")
          .select("*")
          .eq("change_order_id", co.id)
          .order("sort_order")

        if (lineItemsError) throw lineItemsError
        return { changeOrder: co, lineItems: lineItems || [] }
      })

      const changeOrdersWithItems = await Promise.all(lineItemPromises)

      // Prepare invoice line items
      const invoiceLineItems: Partial<InvoiceLineItem>[] = []
      let totalAmount = 0
      let sortOrder = 0

      changeOrdersWithItems.forEach(({ changeOrder, lineItems }) => {
        // Add a section header for each change order
        invoiceLineItems.push({
          description: `Change Order #${changeOrder.co_number}: ${changeOrder.description}`,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: sortOrder++,
          is_section_header: true,
          section_title: `Change Order #${changeOrder.co_number}`,
          source_type: "change_order",
          source_id: changeOrder.id,
        })

        // Add line items from the change order
        lineItems.forEach((item) => {
          invoiceLineItems.push({
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: item.unit_price,
            total: item.total,
            sort_order: sortOrder++,
            is_section_header: false,
            source_type: "change_order_line_item",
            source_id: item.id,
          })
          totalAmount += item.total
        })
      })

      // Create the invoice
      const invoiceId = await createInvoice({
        project_id: projectId,
        person_id: project.person_id,
        invoice_number: "", // Will be generated
        status: "Draft",
        invoice_type: "change_order",
        issue_date: new Date().toISOString(),
        due_date: options.dueDate,
        total_amount: totalAmount,
        amount_paid: 0,
        notes: options.notes || `Invoice generated from approved Change Orders`,
        line_items: invoiceLineItems,
      })

      // Update change orders to mark them as billed
      const { error: updateError } = await supabase
        .from("change_orders")
        .update({ billed: true, invoice_id: invoiceId })
        .in("id", changeOrderIds)

      if (updateError) throw updateError

      return invoiceId
    } catch (error) {
      console.error("Error generating invoice from change orders:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Generate an invoice from billable expenses
   */
  async generateInvoiceFromExpenses(
    projectId: string,
    expenseIds: string[],
    options: {
      markupPercentage?: number
      dueDate?: string
      notes?: string
    } = {},
  ): Promise<string | null> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the expenses
      const expenses = await expenseService.getBillableExpensesByProject(projectId, true)
      const filteredExpenses = expenses.filter((exp) => expenseIds.includes(exp.id))

      if (filteredExpenses.length === 0) {
        throw new Error("No billable expenses found with the provided IDs")
      }

      // Prepare invoice line items
      const markup = options.markupPercentage || 0
      const lineItems: Partial<InvoiceLineItem>[] = []
      let totalAmount = 0

      // Add a section header
      lineItems.push({
        description: "Billable Expenses",
        quantity: 1,
        unit: "section",
        unit_price: 0,
        total: 0,
        sort_order: 0,
        is_section_header: true,
        section_title: "Billable Expenses",
        source_type: "expenses",
        source_id: null,
      })

      // Group expenses by category
      const expensesByCategory = filteredExpenses.reduce(
        (acc, expense) => {
          const category = expense.category || "Uncategorized"
          if (!acc[category]) {
            acc[category] = []
          }
          acc[category].push(expense)
          return acc
        },
        {} as Record<string, typeof filteredExpenses>,
      )

      let sortOrder = 1

      // Add expenses by category
      Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
        // Add category header if there are multiple categories
        if (Object.keys(expensesByCategory).length > 1) {
          lineItems.push({
            description: category,
            quantity: 1,
            unit: "section",
            unit_price: 0,
            total: 0,
            sort_order: sortOrder++,
            is_section_header: true,
            section_title: category,
            source_type: "expense_category",
            source_id: null,
          })
        }

        // Add expenses in this category
        categoryExpenses.forEach((expense) => {
          const unitPrice = expense.amount
          const markupAmount = unitPrice * (markup / 100)
          const total = unitPrice + markupAmount

          lineItems.push({
            description: `${expense.description} (${new Date(expense.expense_date).toLocaleDateString()})`,
            quantity: 1,
            unit: "each",
            unit_price: unitPrice,
            total: total,
            sort_order: sortOrder++,
            is_section_header: false,
            source_type: "expense",
            source_id: expense.id,
          })

          totalAmount += total

          // If there's a markup, add it as a separate line
          if (markup > 0) {
            lineItems.push({
              description: `Markup (${markup}%)`,
              quantity: 1,
              unit: "each",
              unit_price: markupAmount,
              total: markupAmount,
              sort_order: sortOrder++,
              is_section_header: false,
              source_type: "expense_markup",
              source_id: expense.id,
            })
          }
        })
      })

      // Create the invoice
      const invoiceId = await createInvoice({
        project_id: projectId,
        person_id: project.person_id,
        invoice_number: "", // Will be generated
        status: "Draft",
        invoice_type: "expense",
        issue_date: new Date().toISOString(),
        due_date: options.dueDate,
        total_amount: totalAmount,
        amount_paid: 0,
        notes: options.notes || `Invoice generated from billable expenses`,
        line_items: lineItems,
      })

      // Update expenses to mark them as billed
      const { error: updateError } = await supabase
        .from("expenses")
        .update({ billed: true, invoice_id: invoiceId })
        .in("id", expenseIds)

      if (updateError) throw updateError

      return invoiceId
    } catch (error) {
      console.error("Error generating invoice from expenses:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Generate an invoice from time entries
   */
  async generateInvoiceFromTimeEntries(
    projectId: string,
    timeEntryIds: string[],
    options: {
      dueDate?: string
      notes?: string
    } = {},
  ): Promise<string | null> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get the time entries
      const timeEntries = await timeEntryService.getBillableTimeEntriesByProject(projectId, true)
      const filteredTimeEntries = timeEntries.filter((entry) => timeEntryIds.includes(entry.id))

      if (filteredTimeEntries.length === 0) {
        throw new Error("No billable time entries found with the provided IDs")
      }

      // Group time entries by job
      const entriesByJob = filteredTimeEntries.reduce(
        (acc, entry) => {
          const jobId = entry.job_id
          if (!acc[jobId]) {
            acc[jobId] = {
              jobName: entry.job.name,
              hourlyRate: entry.job.hourly_rate,
              totalHours: 0,
              entries: [],
            }
          }
          acc[jobId].entries.push(entry)
          acc[jobId].totalHours += entry.hours
          return acc
        },
        {} as Record<
          string,
          { jobName: string; hourlyRate: number; totalHours: number; entries: typeof filteredTimeEntries }
        >,
      )

      // Prepare invoice line items
      const lineItems: Partial<InvoiceLineItem>[] = []
      let totalAmount = 0

      // Add a section header
      lineItems.push({
        description: "Labor and Services",
        quantity: 1,
        unit: "section",
        unit_price: 0,
        total: 0,
        sort_order: 0,
        is_section_header: true,
        section_title: "Labor and Services",
        source_type: "time_entries",
        source_id: null,
      })

      let sortOrder = 1

      // Add time entries grouped by job
      Object.entries(entriesByJob).forEach(([jobId, jobData]) => {
        const total = jobData.totalHours * jobData.hourlyRate

        // Add job header
        lineItems.push({
          description: jobData.jobName,
          quantity: 1,
          unit: "section",
          unit_price: 0,
          total: 0,
          sort_order: sortOrder++,
          is_section_header: true,
          section_title: jobData.jobName,
          source_type: "job",
          source_id: jobId,
        })

        // Add summary line
        lineItems.push({
          description: `${jobData.jobName} - ${jobData.totalHours.toFixed(2)} hours @ $${jobData.hourlyRate.toFixed(2)}/hour`,
          quantity: jobData.totalHours,
          unit: "hours",
          unit_price: jobData.hourlyRate,
          total: total,
          sort_order: sortOrder++,
          is_section_header: false,
          source_type: "time_entry_summary",
          source_id: jobId,
        })

        // Optionally add detailed time entries
        jobData.entries.forEach((entry) => {
          const entryTotal = entry.hours * jobData.hourlyRate
          lineItems.push({
            description: `${new Date(entry.date).toLocaleDateString()} - ${entry.description || "Time worked"}`,
            quantity: entry.hours,
            unit: "hours",
            unit_price: jobData.hourlyRate,
            total: entryTotal,
            sort_order: sortOrder++,
            is_section_header: false,
            source_type: "time_entry",
            source_id: entry.id,
          })
        })

        totalAmount += total
      })

      // Create the invoice
      const invoiceId = await createInvoice({
        project_id: projectId,
        person_id: project.person_id,
        invoice_number: "", // Will be generated
        status: "Draft",
        invoice_type: "time_materials",
        issue_date: new Date().toISOString(),
        due_date: options.dueDate,
        total_amount: totalAmount,
        amount_paid: 0,
        notes: options.notes || `Invoice generated from billable time entries`,
        line_items: lineItems,
      })

      // Update time entries to mark them as billed
      const { error: updateError } = await supabase
        .from("time_entries")
        .update({ billed: true, invoice_id: invoiceId })
        .in("id", timeEntryIds)

      if (updateError) throw updateError

      return invoiceId
    } catch (error) {
      console.error("Error generating invoice from time entries:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Generate a comprehensive invoice from multiple sources
   */
  async generateComprehensiveInvoice(
    projectId: string,
    options: {
      includeEstimate?: boolean
      changeOrderIds?: string[]
      expenseIds?: string[]
      timeEntryIds?: string[]
      dueDate?: string
      notes?: string
    } = {},
  ): Promise<string | null> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Prepare invoice line items
      const lineItems: Partial<InvoiceLineItem>[] = []
      let totalAmount = 0
      let sortOrder = 0

      // Add estimate items if requested
      if (options.includeEstimate && project.estimate_id) {
        const estimate = await estimateService.getEstimateById(project.estimate_id)
        if (estimate && estimate.status === "Accepted") {
          // Add a section header for the estimate
          lineItems.push({
            description: `Estimate #${estimate.estimate_number}`,
            quantity: 1,
            unit: "section",
            unit_price: 0,
            total: 0,
            sort_order: sortOrder++,
            is_section_header: true,
            section_title: `Estimate #${estimate.estimate_number}`,
            source_type: "estimate",
            source_id: estimate.id,
          })

          // Add line items from the estimate
          estimate.line_items.forEach((item) => {
            lineItems.push({
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              unit_price: item.unit_price,
              total: item.total,
              sort_order: sortOrder++,
              is_section_header: false,
              source_type: "estimate_line_item",
              source_id: item.id,
            })
            totalAmount += item.total
          })
        }
      }

      // Add change order items if requested
      if (options.changeOrderIds && options.changeOrderIds.length > 0) {
        const { data: changeOrders, error } = await supabase
          .from("change_orders")
          .select("*")
          .eq("project_id", projectId)
          .in("id", options.changeOrderIds)
          .eq("status", "Approved")

        if (!error && changeOrders && changeOrders.length > 0) {
          // Add a section header for change orders
          lineItems.push({
            description: "Change Orders",
            quantity: 1,
            unit: "section",
            unit_price: 0,
            total: 0,
            sort_order: sortOrder++,
            is_section_header: true,
            section_title: "Change Orders",
            source_type: "change_orders",
            source_id: null,
          })

          // Get line items for each change order
          for (const co of changeOrders) {
            const { data: coLineItems, error: lineItemsError } = await supabase
              .from("change_order_line_items")
              .select("*")
              .eq("change_order_id", co.id)
              .order("sort_order")

            if (!lineItemsError && coLineItems) {
              // Add a section header for each change order
              lineItems.push({
                description: `Change Order #${co.co_number}: ${co.description}`,
                quantity: 1,
                unit: "section",
                unit_price: 0,
                total: 0,
                sort_order: sortOrder++,
                is_section_header: true,
                section_title: `Change Order #${co.co_number}`,
                source_type: "change_order",
                source_id: co.id,
              })

              // Add line items from the change order
              coLineItems.forEach((item) => {
                lineItems.push({
                  description: item.description,
                  quantity: item.quantity,
                  unit: item.unit,
                  unit_price: item.unit_price,
                  total: item.total,
                  sort_order: sortOrder++,
                  is_section_header: false,
                  source_type: "change_order_line_item",
                  source_id: item.id,
                })
                totalAmount += item.total
              })
            }
          }
        }
      }

      // Add expense items if requested
      if (options.expenseIds && options.expenseIds.length > 0) {
        const expenses = await expenseService.getBillableExpensesByProject(projectId, true)
        const filteredExpenses = expenses.filter((exp) => options.expenseIds!.includes(exp.id))

        if (filteredExpenses.length > 0) {
          // Add a section header for expenses
          lineItems.push({
            description: "Billable Expenses",
            quantity: 1,
            unit: "section",
            unit_price: 0,
            total: 0,
            sort_order: sortOrder++,
            is_section_header: true,
            section_title: "Billable Expenses",
            source_type: "expenses",
            source_id: null,
          })

          // Group expenses by category
          const expensesByCategory = filteredExpenses.reduce(
            (acc, expense) => {
              const category = expense.category || "Uncategorized"
              if (!acc[category]) {
                acc[category] = []
              }
              acc[category].push(expense)
              return acc
            },
            {} as Record<string, typeof filteredExpenses>,
          )

          // Add expenses by category
          Object.entries(expensesByCategory).forEach(([category, categoryExpenses]) => {
            // Add category header if there are multiple categories
            if (Object.keys(expensesByCategory).length > 1) {
              lineItems.push({
                description: category,
                quantity: 1,
                unit: "section",
                unit_price: 0,
                total: 0,
                sort_order: sortOrder++,
                is_section_header: true,
                section_title: category,
                source_type: "expense_category",
                source_id: null,
              })
            }

            // Add expenses in this category
            categoryExpenses.forEach((expense) => {
              lineItems.push({
                description: `${expense.description} (${new Date(expense.expense_date).toLocaleDateString()})`,
                quantity: 1,
                unit: "each",
                unit_price: expense.amount,
                total: expense.amount,
                sort_order: sortOrder++,
                is_section_header: false,
                source_type: "expense",
                source_id: expense.id,
              })

              totalAmount += expense.amount
            })
          })
        }
      }

      // Add time entry items if requested
      if (options.timeEntryIds && options.timeEntryIds.length > 0) {
        const timeEntries = await timeEntryService.getBillableTimeEntriesByProject(projectId, true)
        const filteredTimeEntries = timeEntries.filter((entry) => options.timeEntryIds!.includes(entry.id))

        if (filteredTimeEntries.length > 0) {
          // Group time entries by job
          const entriesByJob = filteredTimeEntries.reduce(
            (acc, entry) => {
              const jobId = entry.job_id
              if (!acc[jobId]) {
                acc[jobId] = {
                  jobName: entry.job.name,
                  hourlyRate: entry.job.hourly_rate,
                  totalHours: 0,
                  entries: [],
                }
              }
              acc[jobId].entries.push(entry)
              acc[jobId].totalHours += entry.hours
              return acc
            },
            {} as Record<
              string,
              { jobName: string; hourlyRate: number; totalHours: number; entries: typeof filteredTimeEntries }
            >,
          )

          // Add a section header for time entries
          lineItems.push({
            description: "Labor and Services",
            quantity: 1,
            unit: "section",
            unit_price: 0,
            total: 0,
            sort_order: sortOrder++,
            is_section_header: true,
            section_title: "Labor and Services",
            source_type: "time_entries",
            source_id: null,
          })

          // Add time entries grouped by job
          Object.entries(entriesByJob).forEach(([jobId, jobData]) => {
            const total = jobData.totalHours * jobData.hourlyRate

            // Add job header
            lineItems.push({
              description: jobData.jobName,
              quantity: 1,
              unit: "section",
              unit_price: 0,
              total: 0,
              sort_order: sortOrder++,
              is_section_header: true,
              section_title: jobData.jobName,
              source_type: "job",
              source_id: jobId,
            })

            // Add summary line
            lineItems.push({
              description: `${jobData.jobName} - ${jobData.totalHours.toFixed(2)} hours @ $${jobData.hourlyRate.toFixed(2)}/hour`,
              quantity: jobData.totalHours,
              unit: "hours",
              unit_price: jobData.hourlyRate,
              total: total,
              sort_order: sortOrder++,
              is_section_header: false,
              source_type: "time_entry_summary",
              source_id: jobId,
            })

            totalAmount += total
          })
        }
      }

      if (lineItems.length === 0) {
        throw new Error("No items to include in the invoice")
      }

      // Create the invoice
      const invoiceId = await createInvoice({
        project_id: projectId,
        person_id: project.person_id,
        invoice_number: "", // Will be generated
        status: "Draft",
        invoice_type: "comprehensive",
        issue_date: new Date().toISOString(),
        due_date: options.dueDate,
        total_amount: totalAmount,
        amount_paid: 0,
        notes: options.notes || `Comprehensive invoice for Project #${project.project_number}`,
        line_items: lineItems,
      })

      // Update related records to mark them as billed
      if (options.changeOrderIds && options.changeOrderIds.length > 0) {
        await supabase
          .from("change_orders")
          .update({ billed: true, invoice_id: invoiceId })
          .in("id", options.changeOrderIds)
      }

      if (options.expenseIds && options.expenseIds.length > 0) {
        await supabase.from("expenses").update({ billed: true, invoice_id: invoiceId }).in("id", options.expenseIds)
      }

      if (options.timeEntryIds && options.timeEntryIds.length > 0) {
        await supabase
          .from("time_entries")
          .update({ billed: true, invoice_id: invoiceId })
          .in("id", options.timeEntryIds)
      }

      return invoiceId
    } catch (error) {
      console.error("Error generating comprehensive invoice:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Record a payment for an invoice
   */
  async recordPayment(invoiceId: string, paymentData: CreatePaymentParams): Promise<string> {
    try {
      // Get the invoice
      const invoice = await getInvoiceById(invoiceId)
      if (!invoice) {
        throw new Error("Invoice not found")
      }

      // Create the payment record
      const paymentId = await paymentService.createPayment(paymentData)

      // Update the invoice with the new payment amount
      const newAmountPaid = (invoice.amount_paid || 0) + paymentData.amount
      const newStatus =
        newAmountPaid >= invoice.total_amount ? "Paid" : newAmountPaid > 0 ? "Partially Paid" : invoice.status

      await updateInvoice(invoiceId, {
        amount_paid: newAmountPaid,
        status: newStatus,
      })

      return paymentId
    } catch (error) {
      console.error("Error recording payment:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Get financial summary for a project
   */
  async getProjectFinancialSummary(projectId: string) {
    try {
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get estimate
      let estimate = null
      if (project.estimate_id) {
        estimate = await estimateService.getEstimateById(project.estimate_id)
      }

      // Get change orders
      const { data: changeOrders, error: coError } = await supabase
        .from("change_orders")
        .select("*")
        .eq("project_id", projectId)

      if (coError) throw coError

      // Get invoices
      const { data: invoices, error: invError } = await supabase
        .from("invoices")
        .select("*")
        .eq("project_id", projectId)

      if (invError) throw invError

      // Get payments
      const { data: payments, error: payError } = await supabase
        .from("payments")
        .select("*")
        .eq("project_id", projectId)

      if (payError) throw payError

      // Get expenses
      const { data: expenses, error: expError } = await supabase
        .from("expenses")
        .select("*")
        .eq("project_id", projectId)

      if (expError) throw expError

      // Get time entries
      const { data: timeEntries, error: timeError } = await supabase
        .from("time_entries")
        .select("*, job:jobs(name, hourly_rate)")
        .eq("project_id", projectId)

      if (timeError) throw timeError

      // Calculate financial metrics
      const estimateTotal = estimate ? estimate.total_amount : 0
      const changeOrdersTotal = changeOrders ? changeOrders.reduce((sum, co) => sum + (co.cost_impact || 0), 0) : 0
      const invoicedTotal = invoices ? invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) : 0
      const paidTotal = payments ? payments.reduce((sum, payment) => sum + (payment.amount || 0), 0) : 0
      const expensesTotal = expenses ? expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0) : 0
      const timeEntriesTotal = timeEntries
        ? timeEntries.reduce((sum, entry) => {
            const hourlyRate = entry.job?.hourly_rate || 0
            return sum + entry.hours * hourlyRate
          }, 0)
        : 0

      // Calculate outstanding balance
      const outstandingBalance = invoicedTotal - paidTotal

      // Calculate profit
      const revenue = paidTotal
      const costs = expensesTotal + timeEntriesTotal
      const profit = revenue - costs
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0

      return {
        projectId,
        projectName: project.project_name,
        estimateTotal,
        changeOrdersTotal,
        contractTotal: estimateTotal + changeOrdersTotal,
        invoicedTotal,
        paidTotal,
        outstandingBalance,
        expensesTotal,
        timeEntriesTotal,
        profit,
        profitMargin,
        estimate,
        changeOrders: changeOrders || [],
        invoices: invoices || [],
        payments: payments || [],
        expenses: expenses || [],
        timeEntries: timeEntries || [],
      }
    } catch (error) {
      console.error("Error getting project financial summary:", error)
      throw new Error(handleSupabaseError(error))
    }
  },
}
