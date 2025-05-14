import type { Database } from "./supabase"

export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"]
export type NewSupplier = Database["public"]["Tables"]["suppliers"]["Insert"]
export type UpdateSupplier = Database["public"]["Tables"]["suppliers"]["Update"]

export interface SupplierFilters {
  isActive?: boolean
  search?: string
}
