import { supabase, handleSupabaseError } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { projectService } from "./projects"
import { projectFinancialLogService } from "./project-financial-log"
import { expenseService } from "./expenses"
import { timeEntryService } from "./time-entries"
import { changeOrderService } from "./change-orders"
import { ExpenseUpdate } from "@/types/expenses"; // Import ExpenseUpdate
import { UpdateTimeEntryParams } from "@/types/time-entries"; // Import UpdateTimeEntryParams
import { UpdateChangeOrderLineItem } from "./change-orders"; // Corrected import path for UpdateChangeOrderLineItem

// Re-define types locally to avoid import conflicts and ensure correct structure
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled" | "Partially Paid"

export interface InvoiceLineItem {
  id?: string
  invoice_id?: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  sort_order: number
  source_type?: string | null
  source_id?: string | null
  linked_change_order_id?: string | null
  linked_expense_id?: string | null
  linked_time_entry_id?: string | null
  section_title?: string | null
  is_section_header?: boolean
  created_at?: string
  updated_at?: string
}

export interface Invoice {
  id?: string
  project_id: string
  person_id: string
  linked_estimate_id?: string | null
  invoice_number: string | null
  status: InvoiceStatus
  invoice_type?: string // Assuming InvoiceType from types/invoices.ts
  issue_date?: string
  due_date?: string
  total_amount: number
  amount_paid: number
  is_paid_in_full?: boolean
  notes?: string
  created_by_user_id?: string | null;
  created_at?: string
  updated_at?: string
  line_items: InvoiceLineItem[] // Explicitly include line_items
}

// Types are already exported when declared above

export const invoiceService = {
  // Helper to get invoice line items
  async getInvoiceLineItemsByInvoiceId(invoiceId: string) {
    try {
      const { data, error } = await supabase
        .from("invoice_line_items")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("sort_order", { ascending: true });

      if (error) {
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error("Error fetching invoice line items:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getInvoices() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select(
          `*,
          project:projects(id, project_name),
          person:people(id, first_name, last_name, business_name)`
        )
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching invoices:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getInvoiceById(id: string) {
    try {
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .select(
          `*,
          project:projects(id, project_name),
          person:people(id, first_name, last_name, business_name)`
        )
        .eq("id", id)
        .single()

      if (invoiceError) {
        throw invoiceError
      }

      if (!invoice) {
        return null
      }

      const { data: lineItems, error: lineItemsError } = await supabase
        .from("invoice_line_items")
        .select("*")
        .eq("invoice_id", id)
        .order("sort_order", { ascending: true })

      if (lineItemsError) {
        throw lineItemsError
      }

      return {
        ...invoice,
        line_items: lineItems || [],
      }
    } catch (error) {
      console.error("Error fetching invoice:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getNextInvoiceNumber() {
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("invoice_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        throw error
      }

      if (data && data.length > 0 && data[0].invoice_number) {
        const match = data[0].invoice_number.match(/INV-(\d+)/)
        if (match && match[1]) {
          const nextNumber = Number.parseInt(match[1], 10) + 1
          return `INV-${nextNumber.toString().padStart(5, "0")}`
        }
      }
      return "INV-00001"
    } catch (error) {
      console.error("Error getting next invoice number:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async createInvoice(invoice: Invoice) {
    try {
      const invoiceId = invoice.id || uuidv4()
      const now = new Date().toISOString()
      const userId = invoice.created_by_user_id;

      const { data: createdInvoiceData, error: invoiceError } = await supabase.from("invoices").insert({
        id: invoiceId,
        project_id: invoice.project_id,
        person_id: invoice.person_id,
        invoice_number: invoice.invoice_number,
        status: invoice.status,
        issue_date: invoice.issue_date,
        due_date: invoice.due_date,
        total_amount: invoice.total_amount,
        amount_paid: invoice.amount_paid,
        notes: invoice.notes,
        created_by_user_id: userId ?? null,
        created_at: now,
        updated_at: now,
      }).select().single();

      if (invoiceError) {
        throw invoiceError
      }

      if (invoice.line_items && invoice.line_items.length > 0) {
        const lineItems = invoice.line_items.map((item, index) => ({
          ...item,
          id: item.id || uuidv4(),
          invoice_id: invoiceId,
          sort_order: item.sort_order || index,
          created_at: now,
          updated_at: now,
        }))
        const { error: lineItemsError } = await supabase.from("invoice_line_items").insert(lineItems)
        if (lineItemsError) throw lineItemsError

        // Mark associated billable items as billed
        for (const item of lineItems) {
          if (item.linked_expense_id) {
            await expenseService.updateExpense(item.linked_expense_id, { billed: true, invoice_id: invoiceId });
          }
          if (item.linked_time_entry_id) {
            await timeEntryService.updateTimeEntry(item.linked_time_entry_id, { billed: true, invoice_id: invoiceId });
          }
          if (item.linked_change_order_id) {
            // Assuming changeOrderService.updateChangeOrderLineItem exists and takes change_order_line_item_id
            // and updates is_billed and invoice_line_item_id
            await changeOrderService.updateChangeOrderLineItem(item.linked_change_order_id, { is_billed: true, invoice_line_item_id: item.id });
          }
        }
      }

      if (invoice.status === "Sent" && invoice.project_id && createdInvoiceData) {
        await projectService.updateProjectInvoicedAmount(invoice.project_id, invoice.total_amount);
        await projectService.updateProjectOutstandingBalance(invoice.project_id, invoice.total_amount);
        const updatedProject = await projectService.getProjectById(invoice.project_id);
        await projectFinancialLogService.addProjectFinancialLog({
          project_id: invoice.project_id,
          transaction_type: "Invoice Sent",
          transaction_id: invoiceId,
          amount_impact: invoice.total_amount,
          description: `Invoice ${invoice.invoice_number} sent`,
          created_by_user_id: userId ?? null,
          new_actual_cost: updatedProject?.actual_cost ?? null,
          new_budget_amount: updatedProject?.budget_amount ?? null,
        });
      }
      return invoiceId
    } catch (error) {
      console.error("Error creating invoice:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateInvoice(id: string, invoice: Invoice) {
    try {
      const now = new Date().toISOString()
      const { error: invoiceError } = await supabase
        .from("invoices")
        .update({
          project_id: invoice.project_id,
          person_id: invoice.person_id,
          invoice_number: invoice.invoice_number,
          status: invoice.status,
          issue_date: invoice.issue_date,
          due_date: invoice.due_date,
          total_amount: invoice.total_amount,
          amount_paid: invoice.amount_paid,
          notes: invoice.notes,
          updated_at: now,
        })
        .eq("id", id)

      if (invoiceError) throw invoiceError

      // Get old line items before deleting to reset their billed status
      const oldLineItems = await this.getInvoiceLineItemsByInvoiceId(id);

      const { error: deleteError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", id)
      if (deleteError) throw deleteError

        // Reset billed status for old associated items
        for (const item of oldLineItems) {
          if (item.linked_expense_id) {
            await expenseService.updateExpense(item.linked_expense_id, { billed: false, invoice_id: null });
          }
          if (item.linked_time_entry_id) {
            await timeEntryService.updateTimeEntry(item.linked_time_entry_id, { billed: false, invoice_id: null });
          }
          if (item.linked_change_order_id) {
            await changeOrderService.updateChangeOrderLineItem(item.linked_change_order_id, { is_billed: false, invoice_line_item_id: null });
          }
        }

      if (invoice.line_items && invoice.line_items.length > 0) {
        const lineItems = invoice.line_items.map((item, index) => ({
          ...item,
          id: item.id || uuidv4(),
          invoice_id: id,
          sort_order: item.sort_order || index,
          created_at: now,
          updated_at: now,
        }))
        const { error: lineItemsError } = await supabase.from("invoice_line_items").insert(lineItems)
        if (lineItemsError) throw lineItemsError

        // Mark associated billable items as billed for new line items
        for (const item of lineItems) {
          if (item.linked_expense_id) {
            await expenseService.updateExpense(item.linked_expense_id, { billed: true, invoice_id: id });
          }
          if (item.linked_time_entry_id) {
            await timeEntryService.updateTimeEntry(item.linked_time_entry_id, { billed: true, invoice_id: id });
          }
          if (item.linked_change_order_id) {
            await changeOrderService.updateChangeOrderLineItem(item.linked_change_order_id, { is_billed: true, invoice_line_item_id: item.id });
          }
        }
      }
      // TODO: Add logic to update project financials (if total_amount changed)
      return id
    } catch (error) {
      console.error("Error updating invoice:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteInvoice(id: string) {
    try {
      const invoiceToDelete = await this.getInvoiceById(id);
      if (!invoiceToDelete) {
        throw new Error(`Invoice with ID ${id} not found.`);
      }

      const { error: lineItemsError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", id)
      if (lineItemsError) throw lineItemsError

      const { error: invoiceError } = await supabase.from("invoices").delete().eq("id", id)
      if (invoiceError) throw invoiceError

      if ((invoiceToDelete.status === "Sent" || invoiceToDelete.status === "Paid") && invoiceToDelete.project_id) {
        await projectService.updateProjectInvoicedAmount(invoiceToDelete.project_id, -invoiceToDelete.total_amount);
        await projectService.updateProjectOutstandingBalance(invoiceToDelete.project_id, -invoiceToDelete.total_amount + invoiceToDelete.amount_paid);
        const updatedProject = await projectService.getProjectById(invoiceToDelete.project_id);
        await projectFinancialLogService.addProjectFinancialLog({
          project_id: invoiceToDelete.project_id,
          transaction_type: "Invoice Deleted",
          transaction_id: id,
          amount_impact: -invoiceToDelete.total_amount,
          description: `Invoice ${invoiceToDelete.invoice_number} deleted`,
          created_by_user_id: invoiceToDelete.created_by_user_id ?? null,
          new_actual_cost: updatedProject?.actual_cost ?? null,
          new_budget_amount: updatedProject?.budget_amount ?? null,
        });

        // Reset billed status for associated items
        const associatedLineItems = await this.getInvoiceLineItemsByInvoiceId(id);
        for (const item of associatedLineItems) {
          if (item.linked_expense_id) {
            await expenseService.updateExpense(item.linked_expense_id, { billed: false, invoice_id: null });
          }
          if (item.linked_time_entry_id) {
            await timeEntryService.updateTimeEntry(item.linked_time_entry_id, { billed: false, invoice_id: null });
          }
          if (item.linked_change_order_id) {
            await changeOrderService.updateChangeOrderLineItem(item.linked_change_order_id, { is_billed: false, invoice_line_item_id: null });
          }
        }
      }
      return true
    } catch (error) {
      console.error("Error deleting invoice:", error)
      throw new Error(handleSupabaseError(error))
    }
  }
}
