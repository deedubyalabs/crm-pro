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

export type Expense = Database["public"]["Tables"]["expenses"]["Row"]
export type NewExpense = Database["public"]["Tables"]["expenses"]["Insert"]
export type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"]

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
  } | null // user can be null if created_by_user_id is null
}
