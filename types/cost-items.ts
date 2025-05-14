import type { Database } from "./supabase"

export type CostItem = Database["public"]["Tables"]["cost_items"]["Row"]
export type NewCostItem = Database["public"]["Tables"]["cost_items"]["Insert"]
export type UpdateCostItem = Database["public"]["Tables"]["cost_items"]["Update"]

export type CostItemType = "Material" | "Labor" | "Equipment" | "Subcontractor" | "Other"

export type CostItemFilters = {
  type?: CostItemType
  search?: string
  isActive?: boolean
}
