export type ChangeOrder = {
  id: string
  project_id: string
  change_order_number: string | null
  status: ChangeOrderStatus
  title: string
  description: string | null
  reason: string | null
  requested_by: string | null
  issue_date: string | null
  approval_date: string | null
  total_amount: number
  impact_on_timeline: number | null
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export type ChangeOrderWithDetails = ChangeOrder & {
  project: {
    project_name: string
  }
  line_items: ChangeOrderLineItem[]
}

export type ChangeOrderLineItem = {
  id: string
  change_order_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  total: number
  sort_order: number
  is_billed: boolean // New field
  invoice_line_item_id: string | null // New field
  created_at: string
  updated_at: string
}

export type ChangeOrderStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Implemented" | "Canceled"

export type CreateChangeOrderParams = {
  project_id: string
  change_order_number?: string
  status?: ChangeOrderStatus
  title: string
  description?: string
  reason?: string
  requested_by?: string
  issue_date?: string
  approval_date?: string
  total_amount?: number
  impact_on_timeline?: number
  line_items: Omit<ChangeOrderLineItem, "id" | "change_order_id" | "created_at" | "updated_at">[]
}

export type UpdateChangeOrderParams = Partial<Omit<ChangeOrder, "id" | "created_at" | "updated_at">> & {
  line_items?: (Omit<ChangeOrderLineItem, "change_order_id" | "created_at" | "updated_at"> & { id?: string })[]
}
