import type { Database } from "./supabase"

export type CostItem = Database["public"]["Tables"]["cost_items"]["Row"] & {
  cost_item_group?: CostItemGroup | null; // Include related group data
}
export type NewCostItem = Database["public"]["Tables"]["cost_items"]["Insert"]
export type UpdateCostItem = Database["public"]["Tables"]["cost_items"]["Update"]

export type CostItemType = "Material" | "Labor" | "Equipment" | "Subcontractor" | "Other"

export type CostItemFilters = {
  type?: CostItemType
  search?: string
  isActive?: boolean
  groupId?: string // Added for filtering by group
}

export interface CostItemGroup {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export type NewCostItemGroup = Database["public"]["Tables"]["cost_item_groups"]["Insert"]
export type UpdateCostItemGroup = Database["public"]["Tables"]["cost_item_groups"]["Update"]
