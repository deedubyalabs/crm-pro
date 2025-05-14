export type Invoice = {
  id: string
  project_id: string
  person_id: string
  invoice_number: string | null
  status: InvoiceStatus
  invoice_type: InvoiceType
  issue_date: string | null
  due_date: string | null
  total_amount: number
  amount_paid: number
  notes: string | null
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export type Payment = {
  id: string
  invoice_id: string
  amount: number
  payment_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type InvoiceWithDetails = Invoice & {
  project: {
    project_name: string
  }
  person: {
    first_name: string | null
    last_name: string | null
    business_name: string | null
  }
  line_items: InvoiceLineItem[]
  payments?: Payment[]
}

export type InvoiceLineItem = {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  sort_order: number
  source_type: string | null
  source_id: string | null
  section_title: string | null
  is_section_header: boolean
  created_at: string
  updated_at: string
}

export type InvoiceStatus = "Draft" | "Sent" | "Partially Paid" | "Paid" | "Overdue" | "Void"

export type InvoiceType = "standard" | "deposit" | "change_order" | "expense" | "time_materials" | "comprehensive"

export type CreateInvoiceParams = {
  project_id: string
  person_id: string
  invoice_number?: string
  status?: InvoiceStatus
  invoice_type?: InvoiceType
  issue_date?: string
  due_date?: string
  total_amount?: number
  amount_paid?: number
  notes?: string
  line_items: Omit<InvoiceLineItem, "id" | "invoice_id" | "created_at" | "updated_at">[]
}

export type UpdateInvoiceParams = Partial<Omit<Invoice, "id" | "created_at" | "updated_at">> & {
  line_items?: (Omit<InvoiceLineItem, "invoice_id" | "created_at" | "updated_at"> & { id?: string })[]
}
