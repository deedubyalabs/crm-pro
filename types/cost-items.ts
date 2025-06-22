import type { Database } from "./supabase"

export type CostItemType = "Material" | "Labor" | "Equipment" | "Subcontractor" | "Overhead" | "Other"

export type CostItem = {
  id: string;
  item_code: string;
  name: string;
  description: string | null;
  type: CostItemType;
  unit: string;
  unit_cost: number;
  default_markup: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cost_item_group_id: string | null;
} & {
  cost_item_group?: CostItemGroup | null; // Include related group data
}

export type NewCostItem = Database["public"]["Tables"]["cost_items"]["Insert"]
export type UpdateCostItem = Database["public"]["Tables"]["cost_items"]["Update"]

export type CostItemFilters = {
  type?: CostItemType
  search?: string
  isActive?: boolean
  groupId?: string // Added for filtering by group
  page?: number // New: for pagination
  limit?: number // New: for pagination
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
