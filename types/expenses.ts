import type { Database } from "./supabase"

export type ExpenseCategory =
  | "materials"
  | "labor"
  | "equipment"
  | "subcontractor"
  | "travel"
  | "permits"
  | "office"
  | "marketing"
  | "insurance"
  | "utilities"
  | "rent"
  | "other"

export type ExpenseStatus = "pending" | "approved" | "reimbursed" | "rejected"

export type ExpensePaymentMethod =
  | "credit_card"
  | "debit_card"
  | "cash"
  | "check"
  | "bank_transfer"
  | "company_account"
  | "personal_funds"
  | "other"

export interface Expense {
  id: string
  project_id: string | null
  job_id: string | null
  user_id: string
  category: ExpenseCategory
  description: string
  amount: number
  tax_amount: number | null
  date: string
  receipt_url: string | null
  status: ExpenseStatus
  payment_method: ExpensePaymentMethod
  vendor: string | null
  notes: string | null
  billable: boolean
  reimbursable: boolean
  reimbursed_date: string | null
  created_at: string
  updated_at: string
}

export interface ExpenseWithDetails extends Expense {
  project: {
    id: string
    project_name: string
  } | null
  job: {
    id: string
    title: string
  } | null
  user: {
    id: string
    name: string
    email: string
  }
}

export type NewExpense = Omit<Expense, "id" | "created_at" | "updated_at">

export type ExpenseUpdate = Partial<Omit<Expense, "id" | "created_at" | "updated_at">>

export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"]
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"]
export type ExpenseUpdate_DB = Database["public"]["Tables"]["expenses"]["Update"]
