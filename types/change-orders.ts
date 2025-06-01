export type ChangeOrder = {
  id: string
  project_id: string
  person_id: string // Added person_id based on schema update
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
  approved_by_person_id: string | null // Added approved_by_person_id based on schema update
  created_by_user_id: string | null
  created_at: string
  updated_at: string
}

export type ChangeOrderWithDetails = ChangeOrder & {
  project: {
    project_name: string
  };
  line_items: ChangeOrderLineItem[];
  approved_by?: { // Add approved_by relationship
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    full_name: string; // Assuming full_name is derived in the service
  } | null;
}

export type ChangeOrderLineItem = {
  id: string
  change_order_id: string
  description: string
  quantity: number
  unit: string
  unit_price: number
  // Removed markup as it's not a database column
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
  description: string // Made description required
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
