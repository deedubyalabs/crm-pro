export type EstimateStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired"
export type DiscountType = "percentage" | "fixed" | "" | null
export type PaymentScheduleDueType =
  | "on_acceptance"
  | "on_completion"
  | "specific_date"
  | "days_after_invoice"
  | "days_after_start"
  | string // Allow other string for flexibility if needed, or make more restrictive

export interface Estimate {
  id: string
  estimate_number: string | null
  person_id: string
  opportunity_id: string // Corrected based on database schema (NOT NULL)
  project_id: string | null // New field
  status: EstimateStatus
  issue_date: string | null
  expiration_date: string | null
  subtotal_amount: number
  discount_type: DiscountType
  discount_value: number | null
  total_amount: number
  notes: string | null
  terms_and_conditions: string | null // New field
  scope_of_work: string | null // New field
  cover_sheet_details: string | null // New field
  is_converted_to_project: boolean // New field
  is_converted_to_bov: boolean // New field
  is_initial_invoice_generated: boolean // New field
  blueprint_of_values_id: string | null // New field
  initial_invoice_id: string | null // New field
  created_at: string
  updated_at: string
  created_by: string | null
  updated_by: string | null
  deposit_required: boolean
  deposit_amount: number | null
  deposit_percentage: number | null
}

export interface NewEstimate {
  estimate_number?: string | null
  person_id: string
  opportunity_id: string // Corrected based on database schema (NOT NULL)
  project_id?: string | null // New field
  status?: EstimateStatus
  issue_date?: string | null
  expiration_date?: string | null
  subtotal_amount?: number
  discount_type?: DiscountType
  discount_value?: number | null
  total_amount?: number
  notes?: string | null
  terms_and_conditions?: string | null // New field
  scope_of_work?: string | null // New field
  cover_sheet_details?: string | null // New field
  is_converted_to_project?: boolean // New field
  is_converted_to_bov?: boolean // New field
  is_initial_invoice_generated?: boolean // New field
  blueprint_of_values_id?: string | null // New field
  initial_invoice_id?: string | null // New field
  created_by?: string | null
  deposit_required?: boolean
  deposit_amount?: number | null
  deposit_percentage?: number | null
}

export interface UpdateEstimate {
  estimate_number?: string | null
  person_id?: string
  opportunity_id?: string // Corrected based on database schema (NOT NULL)
  project_id?: string | null // New field
  status?: EstimateStatus
  issue_date?: string | null
  expiration_date?: string | null
  subtotal_amount?: number
  discount_type?: DiscountType
  discount_value?: number | null
  total_amount?: number
  notes?: string | null
  terms_and_conditions?: string | null // New field
  scope_of_work?: string | null // New field
  cover_sheet_details?: string | null // New field
  is_converted_to_project?: boolean // New field
  is_converted_to_bov?: boolean // New field
  is_initial_invoice_generated?: boolean // New field
  blueprint_of_values_id?: string | null // New field
  initial_invoice_id?: string | null // New field
  updated_by?: string | null
  deposit_required?: boolean
  deposit_amount?: number | null
  deposit_percentage?: number | null
}

export interface EstimateLineItem {
  id: string
  estimate_id: string
  cost_item_id: string | null
  description: string
  quantity: number
  unit: string
  unit_cost: number
  markup: number
  total: number
  sort_order: number
  section_name: string | null
  is_optional: boolean // Added for optional items
  is_taxable: boolean // Added for taxable items
  assigned_to_user_id: string | null // Added for item assignment
  created_at: string
  updated_at: string
  costItem?: {
    id: string
    item_code: string
    name: string
    type: string
  } | null
}

export interface NewEstimateLineItem {
  estimate_id: string
  cost_item_id?: string | null
  description: string
  quantity: number
  unit: string
  unit_cost: number
  markup: number
  total: number
  sort_order?: number
  section_id?: string | null // Changed from section_name to section_id
  is_optional?: boolean // Added for optional items
  is_taxable?: boolean // Added for taxable items
  assigned_to_user_id?: string | null // Added for item assignment
}

export interface UpdateEstimateLineItem {
  cost_item_id?: string | null
  description?: string
  quantity?: number
  unit?: string
  unit_cost?: number
  markup?: number
  total?: number
  sort_order?: number
  section_id?: string | null // Changed from section_name to section_id
  is_optional?: boolean // Added for optional items
  is_taxable?: boolean // Added for taxable items
  assigned_to_user_id?: string | null // Added for item assignment
}

export interface EstimateSection {
  id: string;
  estimate_id: string;
  name: string;
  description: string | null;
  is_optional: boolean;
  is_taxable: boolean; // Added for taxable sections
  sort_order: number;
  created_at: string;
  updated_at: string;
  line_items: EstimateLineItem[]; // Line items belonging to this section
}

export interface NewEstimateSection {
  estimate_id: string;
  name: string;
  description?: string | null;
  is_optional?: boolean;
  sort_order?: number;
}

export interface UpdateEstimateSection {
  name?: string;
  description?: string | null;
  is_optional?: boolean;
  sort_order?: number;
}

export interface EstimatePaymentSchedule {
  id: string
  estimate_id: string
  description: string
  amount: number
  due_type: PaymentScheduleDueType | null
  due_days: number | null // Added due_days
  due_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface NewEstimatePaymentSchedule {
  percentage: null
  estimate_id: string
  description: string
  amount: number
  due_type?: PaymentScheduleDueType | null
  due_days?: number | null // Added due_days
  due_date?: string | null
  sort_order?: number
}

export interface UpdateEstimatePaymentSchedule {
  description?: string
  amount?: number
  due_type?: PaymentScheduleDueType
  due_days?: number | null // Added due_days
  due_date?: string | null
  sort_order?: number
}

export interface EstimateWithDetails extends Estimate {
  lineItems: any
  title: string; // Added title property
  person: {
    id: string
    first_name: string | null
    last_name: string | null
    business_name: string | null
    email: string | null
    phone: string | null
    name: string
  }
  opportunity: {
    id: string
    opportunity_name: string
  } | null
  sections: EstimateSection[]; // Changed from lineItems to sections
  paymentSchedules?: EstimatePaymentSchedule[]
  tax_rate_percentage?: number | null; // Added tax rate percentage
}

export interface EstimateFilters {
  status?: EstimateStatus
  opportunityId?: string
  personId?: string
  search?: string
  startDate?: string
  endDate?: string
}
