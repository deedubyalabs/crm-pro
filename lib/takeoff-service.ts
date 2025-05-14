import { supabase, handleSupabaseError } from "./supabase"

export interface TakeoffData {
  shapes: any[]
  measurements: any[]
  scale1To1: number
  scaleUnit: string
}

export interface Takeoff {
  id: string
  project_id: string
  name: string
  description: string | null
  data: TakeoffData
  created_at: string
  updated_at: string
}

export const takeoffService = {
  async getTakeoffsForProject(projectId: string): Promise<Takeoff[]> {
    try {
      const { data, error } = await supabase
        .from("takeoffs")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getTakeoffById(id: string): Promise<Takeoff | null> {
    try {
      const { data, error } = await supabase.from("takeoffs").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") return null // Not found
        throw error
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createTakeoff(
    projectId: string,
    name: string,
    description: string | null,
    data: TakeoffData,
  ): Promise<Takeoff> {
    try {
      const { data: takeoff, error } = await supabase
        .from("takeoffs")
        .insert({
          project_id: projectId,
          name,
          description,
          data,
        })
        .select()
        .single()

      if (error) throw error
      return takeoff
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateTakeoff(
    id: string,
    updates: Partial<Omit<Takeoff, "id" | "project_id" | "created_at" | "updated_at">>,
  ): Promise<Takeoff> {
    try {
      const { data, error } = await supabase
        .from("takeoffs")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteTakeoff(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("takeoffs").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async generateEstimateFromTakeoff(takeoffId: string, markup = 20): Promise<string> {
    try {
      // Get the takeoff data
      const takeoff = await this.getTakeoffById(takeoffId)
      if (!takeoff) throw new Error("Takeoff not found")

      // Extract materials from shapes
      const materials: Record<string, { name: string; unit: string; unitCost: number; quantity: number }> = {}

      takeoff.data.shapes.forEach((shape) => {
        if (!shape.materialType || !shape.quantity) return

        const key = `${shape.materialType}-${shape.materialUnitCost}`

        if (!materials[key]) {
          materials[key] = {
            name: shape.materialName || "",
            unit: shape.materialUnit || "",
            unitCost: shape.materialUnitCost || 0,
            quantity: 0,
          }
        }

        materials[key].quantity += shape.quantity
      })

      // Create an estimate
      const { data: estimate, error } = await supabase
        .from("estimates")
        .insert({
          project_id: takeoff.project_id,
          name: `Estimate from ${takeoff.name}`,
          description: `Automatically generated from takeoff: ${takeoff.name}`,
          status: "draft",
          subtotal: 0, // Will be calculated based on line items
          tax_rate: 0,
          tax_amount: 0,
          total: 0, // Will be calculated based on line items
        })
        .select()
        .single()

      if (error) throw error

      // Create line items for each material
      let subtotal = 0

      for (const [key, material] of Object.entries(materials)) {
        const lineItemTotal = material.quantity * material.unitCost * (1 + markup / 100)
        subtotal += lineItemTotal

        await supabase.from("estimate_line_items").insert({
          estimate_id: estimate.id,
          description: material.name,
          quantity: material.quantity,
          unit: material.unit,
          unit_cost: material.unitCost,
          markup: markup,
          total: lineItemTotal,
        })
      }

      // Update the estimate totals
      await supabase
        .from("estimates")
        .update({
          subtotal,
          total: subtotal,
        })
        .eq("id", estimate.id)

      return estimate.id
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
