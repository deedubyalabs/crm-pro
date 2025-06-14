import { supabase, handleSupabaseError } from "./supabase"
import type { CostItem, NewCostItem, UpdateCostItem, CostItemFilters, CostItemGroup, NewCostItemGroup, UpdateCostItemGroup } from "@/types/cost-items"

export const costItemService = {
  async getCostItems(
    filters?: CostItemFilters,
  ): Promise<{ costItems: CostItem[]; totalCount: number }> {
    try {
      let query = supabase.from("cost_items").select("*, cost_item_groups(*)", { count: "exact" }).order("name")

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

      if (filters?.groupId) {
        query = query.eq("cost_item_group_id", filters.groupId)
      }

      // Apply pagination
      if (filters?.page && filters?.limit) {
        const from = (filters.page - 1) * filters.limit
        const to = from + filters.limit - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) throw error
      return { costItems: data || [], totalCount: count || 0 }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getCostItemById(id: string): Promise<CostItem | null> {
    try {
      const { data, error } = await supabase.from("cost_items").select("*, cost_item_groups(*)").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createCostItem(costItem: NewCostItem): Promise<CostItem> {
    try {
      const { data, error } = await supabase.from("cost_items").insert(costItem).select("*, cost_item_groups(*)").single()

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
        .select("*, cost_item_groups(*)")
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

  async bulkDeleteCostItems(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase.from("cost_items").delete().in("id", ids)
      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Cost Item Group functions
  async getCostItemGroups(): Promise<CostItemGroup[]> {
    try {
      const { data, error } = await supabase.from("cost_item_groups").select("*").order("name");
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getCostItemGroupById(id: string): Promise<CostItemGroup | null> {
    try {
      const { data, error } = await supabase.from("cost_item_groups").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    } catch (error) {
        throw new Error(handleSupabaseError(error));
    }
  },

  async createCostItemGroup(group: NewCostItemGroup): Promise<CostItemGroup> {
    try {
      const { data, error } = await supabase.from("cost_item_groups").insert(group).select().single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateCostItemGroup(id: string, updates: UpdateCostItemGroup): Promise<CostItemGroup> {
    try {
      const { data, error } = await supabase
        .from("cost_item_groups")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteCostItemGroup(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("cost_item_groups").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },
}
