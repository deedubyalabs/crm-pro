import { supabase, handleSupabaseError } from "./supabase"
import type { Supplier, NewSupplier, UpdateSupplier, SupplierFilters } from "@/types/suppliers"

export const supplierService = {
  async getSuppliers(filters?: SupplierFilters): Promise<Supplier[]> {
    try {
      let query = supabase.from("suppliers").select("*").order("name")

      // Apply filters
      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const { data, error } = await supabase.from("suppliers").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createSupplier(supplier: NewSupplier): Promise<Supplier> {
    try {
      const { data, error } = await supabase.from("suppliers").insert(supplier).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateSupplier(id: string, updates: UpdateSupplier): Promise<Supplier> {
    try {
      const { data, error } = await supabase
        .from("suppliers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteSupplier(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("suppliers").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
