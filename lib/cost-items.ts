import { supabase, handleSupabaseError } from "./supabase"
import type { CostItem, NewCostItem, UpdateCostItem, CostItemFilters, CostItemGroup, NewCostItemGroup, UpdateCostItemGroup, CostItemType } from "@/types/cost-items"

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

      let queryForCount = supabase.from("cost_items").select("id", { count: "exact" });

      // Apply filters to the count query
      if (filters?.type) {
        queryForCount = queryForCount.eq("type", filters.type)
      }

      if (filters?.isActive !== undefined) {
        queryForCount = queryForCount.eq("is_active", filters.isActive)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        queryForCount = queryForCount.or(`name.ilike.${searchTerm},item_code.ilike.${searchTerm},description.ilike.${searchTerm}`)
      }

      if (filters?.groupId) {
        queryForCount = queryForCount.eq("cost_item_group_id", filters.groupId)
      }

      const { count: totalCount, error: countError } = await queryForCount;

      if (countError) throw countError;

      let effectivePage = filters?.page || 1;
      const limit = filters?.limit || 10;
      const totalPages = Math.ceil((totalCount || 0) / limit);

      // Adjust page if it's out of bounds for the filtered results
      if (effectivePage > totalPages && totalPages > 0) {
        effectivePage = 1; // Reset to first page if current page is out of bounds
      } else if (totalPages === 0) {
        effectivePage = 1; // If no items, ensure page is 1
      }

      const from = (effectivePage - 1) * limit;
      const to = from + limit - 1;

      // Now, build and execute the query for actual data with pagination
      let queryForData = supabase.from("cost_items").select("*, cost_item_groups(*)").order("name");

      // Apply filters to the data query
      if (filters?.type) {
        queryForData = queryForData.eq("type", filters.type)
      }

      if (filters?.isActive !== undefined) {
        queryForData = queryForData.eq("is_active", filters.isActive)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        queryForData = queryForData.or(`name.ilike.${searchTerm},item_code.ilike.${searchTerm},description.ilike.${searchTerm}`)
      }

      if (filters?.groupId) {
        queryForData = queryForData.eq("cost_item_group_id", filters.groupId)
      }

      const { data, error } = await queryForData.range(from, to);

      if (error) throw error;
      // Explicitly cast data to CostItem[] and ensure 'type' is CostItemType
      const typedCostItems: CostItem[] = (data || []).map(item => ({
        ...item,
        type: item.type as CostItemType, // Cast 'type' to CostItemType
        sync_with_bigbox: item.sync_with_bigbox as boolean | null, // Ensure nullable boolean
      }));
      return { costItems: typedCostItems, totalCount: totalCount || 0 };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
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
