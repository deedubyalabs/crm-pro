import { supabase, handleSupabaseError } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"

export interface InvoiceLineItem {
  id?: string
  invoice_id?: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  sort_order: number
}

export interface Invoice {
  id?: string
  project_id: string
  person_id: string
  invoice_number: string
  status: InvoiceStatus
  issue_date?: string
  due_date?: string
  total_amount: number
  amount_paid: number
  notes?: string
  created_at?: string
  updated_at?: string
  line_items: InvoiceLineItem[]
}

export async function getInvoices() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        project:projects(id, project_name),
        person:people(id, first_name, last_name, business_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching invoices:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getInvoiceById(id: string) {
  try {
    // Fetch the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        project:projects(id, project_name),
        person:people(id, first_name, last_name, business_name)
      `)
      .eq("id", id)
      .single()

    if (invoiceError) {
      throw invoiceError
    }

    if (!invoice) {
      return null
    }

    // Fetch the line items
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
}

export async function getNextInvoiceNumber() {
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
      // Extract the numeric part of the invoice number
      const match = data[0].invoice_number.match(/INV-(\d+)/)
      if (match && match[1]) {
        const nextNumber = Number.parseInt(match[1], 10) + 1
        return `INV-${nextNumber.toString().padStart(5, "0")}`
      }
    }

    // Default to INV-00001 if no invoices exist
    return "INV-00001"
  } catch (error) {
    console.error("Error getting next invoice number:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function createInvoice(invoice: Invoice) {
  try {
    const invoiceId = invoice.id || uuidv4()
    const now = new Date().toISOString()

    // Create the invoice
    const { error: invoiceError } = await supabase.from("invoices").insert({
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
      created_at: now,
      updated_at: now,
    })

    if (invoiceError) {
      throw invoiceError
    }

    // Create the line items
    if (invoice.line_items && invoice.line_items.length > 0) {
      const lineItems = invoice.line_items.map((item, index) => ({
        id: item.id || uuidv4(),
        invoice_id: invoiceId,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
        sort_order: item.sort_order || index,
        created_at: now,
        updated_at: now,
      }))

      const { error: lineItemsError } = await supabase.from("invoice_line_items").insert(lineItems)

      if (lineItemsError) {
        throw lineItemsError
      }
    }

    return invoiceId
  } catch (error) {
    console.error("Error creating invoice:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateInvoice(id: string, invoice: Invoice) {
  try {
    const now = new Date().toISOString()

    // Update the invoice
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

    if (invoiceError) {
      throw invoiceError
    }

    // Delete existing line items
    const { error: deleteError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", id)

    if (deleteError) {
      throw deleteError
    }

    // Create new line items
    if (invoice.line_items && invoice.line_items.length > 0) {
      const lineItems = invoice.line_items.map((item, index) => ({
        id: item.id || uuidv4(),
        invoice_id: id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
        sort_order: item.sort_order || index,
        created_at: now,
        updated_at: now,
      }))

      const { error: lineItemsError } = await supabase.from("invoice_line_items").insert(lineItems)

      if (lineItemsError) {
        throw lineItemsError
      }
    }

    return id
  } catch (error) {
    console.error("Error updating invoice:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteInvoice(id: string) {
  try {
    // Delete line items first
    const { error: lineItemsError } = await supabase.from("invoice_line_items").delete().eq("invoice_id", id)

    if (lineItemsError) {
      throw lineItemsError
    }

    // Delete the invoice
    const { error: invoiceError } = await supabase.from("invoices").delete().eq("id", id)

    if (invoiceError) {
      throw invoiceError
    }

    return true
  } catch (error) {
    console.error("Error deleting invoice:", error)
    throw new Error(handleSupabaseError(error))
  }
}
