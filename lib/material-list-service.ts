import { supabase, handleSupabaseError } from "./supabase"
import { estimateService } from "./estimates"
import { costItemService } from "./cost-items"
import type {
  MaterialList,
  NewMaterialList,
  UpdateMaterialList,
  MaterialListItem,
  NewMaterialListItem,
  UpdateMaterialListItem,
  MaterialListWithDetails,
  MaterialListFilters,
} from "@/types/material-lists"

const DEFAULT_WASTE_FACTORS = [
  { materialType: "wood", defaultFactor: 15 },
  { materialType: "metal", defaultFactor: 10 },
  { materialType: "concrete", defaultFactor: 5 },
  { materialType: "other", defaultFactor: 10 },
]

export const materialListService = {
  async getMaterialLists(filters?: MaterialListFilters): Promise<MaterialList[]> {
    try {
      let query = supabase
        .from("material_lists")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          estimate:estimate_id (
            id,
            estimate_number
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId)
      }

      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getMaterialListById(id: string): Promise<MaterialListWithDetails | null> {
    try {
      const { data: materialList, error } = await supabase
        .from("material_lists")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          estimate:estimate_id (
            id,
            estimate_number
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!materialList || !materialList.project) return null

      // Get material list items
      const { data: items, error: itemsError } = await supabase
        .from("material_list_items")
        .select(`
          *,
          costItem:cost_item_id (
            *
          ),
          supplier:supplier_id (
            *
          )
        `)
        .eq("material_list_id", id)
        .order("created_at")

      if (itemsError) throw itemsError

      return {
        ...materialList,
        project: materialList.project!,
        items: items || [],
        estimate: materialList.estimate ? {
          ...materialList.estimate,
          estimate_number: materialList.estimate.estimate_number || ''
        } : null
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createMaterialList(materialList: NewMaterialList): Promise<MaterialList> {
    try {
      const { data, error } = await supabase.from("material_lists").insert(materialList).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateMaterialList(id: string, updates: UpdateMaterialList): Promise<MaterialList> {
    try {
      const { data, error } = await supabase
        .from("material_lists")
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

  async deleteMaterialList(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("material_lists").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Material list items methods
  async getMaterialListItems(materialListId: string): Promise<MaterialListItem[]> {
    try {
      const { data, error } = await supabase
        .from("material_list_items")
        .select(`
          *,
          costItem:cost_item_id (
            *
          ),
          supplier:supplier_id (
            *
          )
        `)
        .eq("material_list_id", materialListId)
        .order("created_at")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addMaterialListItem(item: NewMaterialListItem): Promise<MaterialListItem> {
    try {
      const { data, error } = await supabase.from("material_list_items").insert(item).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateMaterialListItem(id: string, updates: UpdateMaterialListItem): Promise<MaterialListItem> {
    try {
      const { data, error } = await supabase
        .from("material_list_items")
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

  async deleteMaterialListItem(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("material_list_items").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Generate material list from estimate
  async generateFromEstimate(
    estimateId: string,
    projectId: string,
    options: {
      name?: string
      description?: string
      applyWasteFactors?: boolean
    } = {},
  ): Promise<MaterialListWithDetails> {
    try {
      // Get the estimate with line items
      const estimate = await estimateService.getEstimateById(estimateId)
      if (!estimate) {
        throw new Error("Estimate not found")
      }

      // Create a new material list
      const materialList: NewMaterialList = {
        name: options.name || `Material List for ${estimate.estimate_number || "Estimate"}`,
        description: options.description || `Generated from estimate ${estimate.estimate_number || estimateId}`,
        project_id: projectId,
        estimate_id: estimateId,
        status: "draft",
      }

      const createdList = await this.createMaterialList(materialList)

      // Process each line item and create material list items
      const materialItems: NewMaterialListItem[] = []

      for (const lineItem of estimate.lineItems) {
        // Skip items without a cost item reference
        if (!lineItem.cost_item_id) continue

        // Get the cost item details
        const costItem = lineItem.costItem || (await costItemService.getCostItemById(lineItem.cost_item_id))
        if (!costItem) continue

        // Determine waste factor based on material type
        let wasteFactor = 0
        if (options.applyWasteFactors) {
          const materialType = costItem.type?.toLowerCase() || "other"
          const wasteFactorInfo = DEFAULT_WASTE_FACTORS.find((wf) => wf.materialType.toLowerCase() === materialType)
          wasteFactor = wasteFactorInfo?.defaultFactor || 10 // Default to 10% if not found
        }

        // Calculate quantity with waste factor
        const baseQuantity = lineItem.quantity
        const adjustedQuantity = baseQuantity * (1 + wasteFactor / 100)

        // Create the material list item
        const materialItem: NewMaterialListItem = {
          material_list_id: createdList.id,
          cost_item_id: costItem.id,
          description: lineItem.description || costItem.name,
          quantity: adjustedQuantity,
          unit: lineItem.unit,
          base_quantity: baseQuantity,
          waste_factor: wasteFactor,
          unit_cost: lineItem.unit_cost,
          total_cost: lineItem.unit_cost * adjustedQuantity,
          status: "pending",
        }

        materialItems.push(materialItem)
      }

      // Batch insert all material items
      if (materialItems.length > 0) {
        const { error } = await supabase.from("material_list_items").insert(materialItems)

        if (error) throw error
      }

      // Return the complete material list with items
      return (await this.getMaterialListById(createdList.id)) as MaterialListWithDetails
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
