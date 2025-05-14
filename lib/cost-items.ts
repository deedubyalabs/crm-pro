import { supabase, handleSupabaseError } from "./supabase"
import type { CostItem, NewCostItem, UpdateCostItem, CostItemFilters } from "@/types/cost-items"

export const costItemService = {
  async getCostItems(filters?: CostItemFilters): Promise<CostItem[]> {
    try {
      let query = supabase.from("cost_items").select("*").order("name")

      // Apply filters
      if (filters?.type) {
        query = query.eq("type", filters.type)
      }

      if (filters?.isActive !== undefined) {
        query = query.eq("is_active", filters.isActive)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.or(`name.ilike.${searchTerm},item_code.ilike.${searchTerm},description.ilike.${searchTerm}`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getCostItemById(id: string): Promise<CostItem | null> {
    try {
      const { data, error } = await supabase.from("cost_items").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createCostItem(costItem: NewCostItem): Promise<CostItem> {
    try {
      const { data, error } = await supabase.from("cost_items").insert(costItem).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateCostItem(id: string, updates: UpdateCostItem): Promise<CostItem> {
    try {
      const { data, error } = await supabase
        .from("cost_items")
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

  async deleteCostItem(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("cost_items").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
