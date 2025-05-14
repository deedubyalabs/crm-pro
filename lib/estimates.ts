import { supabase, handleSupabaseError } from "./supabase"
import type {
  Estimate,
  NewEstimate,
  UpdateEstimate,
  EstimateLineItem,
  NewEstimateLineItem,
  UpdateEstimateLineItem,
  EstimateWithDetails,
  EstimateFilters,
  EstimatePaymentSchedule,
  NewEstimatePaymentSchedule,
  UpdateEstimatePaymentSchedule,
  LineItemsBySection,
} from "@/types/estimates"

export const estimateService = {
  async getEstimates(filters?: EstimateFilters): Promise<Estimate[]> {
    try {
      let query = supabase
        .from("estimates")
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.opportunityId) {
        query = query.eq("opportunity_id", filters.opportunityId)
      }

      if (filters?.personId) {
        query = query.eq("person_id", filters.personId)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.or(`estimate_number.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      }

      if (filters?.startDate) {
        query = query.gte("issue_date", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("issue_date", filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getEstimateById(id: string): Promise<EstimateWithDetails | null> {
    try {
      const { data: estimate, error } = await supabase
        .from("estimates")
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!estimate) return null

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from("estimate_line_items")
        .select(`
          *,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", id)
        .order("sort_order")

      if (lineItemsError) throw lineItemsError

      // Get payment schedules
      const { data: paymentSchedules, error: paymentSchedulesError } = await supabase
        .from("estimate_payment_schedules")
        .select("*")
        .eq("estimate_id", id)
        .order("sort_order")

      if (paymentSchedulesError) throw paymentSchedulesError

      // Format the person name
      const personName =
        estimate.person.business_name || `${estimate.person.first_name || ""} ${estimate.person.last_name || ""}`.trim()

      return {
        ...estimate,
        person: {
          ...estimate.person,
          name: personName,
        },
        lineItems: lineItems || [],
        paymentSchedules: paymentSchedules || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createEstimate(
    estimate: NewEstimate,
    lineItems: NewEstimateLineItem[] = [],
    paymentSchedules: NewEstimatePaymentSchedule[] = [],
  ): Promise<Estimate> {
    try {
      // Calculate subtotal from line items
      const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

      // Calculate total with discount
      let totalAmount = subtotal
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotal * (1 - estimate.discount_value / 100)
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotal - estimate.discount_value
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount)

      // Start a transaction
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          ...estimate,
          subtotal_amount: subtotal,
          total_amount: totalAmount,
        })
        .select()
        .single()

      if (error) throw error

      // If we have line items, add them
      if (lineItems.length > 0) {
        const itemsWithEstimateId = lineItems.map((item, index) => ({
          ...item,
          estimate_id: data.id,
          sort_order: index,
        }))

        const { error: lineItemsError } = await supabase.from("estimate_line_items").insert(itemsWithEstimateId)

        if (lineItemsError) throw lineItemsError
      }

      // If we have payment schedules, add them
      if (paymentSchedules.length > 0) {
        const schedulesWithEstimateId = paymentSchedules.map((schedule, index) => ({
          ...schedule,
          estimate_id: data.id,
          sort_order: index,
        }))

        const { error: schedulesError } = await supabase
          .from("estimate_payment_schedules")
          .insert(schedulesWithEstimateId)

        if (schedulesError) throw schedulesError
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateEstimate(
    id: string,
    updates: UpdateEstimate,
    lineItems?: NewEstimateLineItem[],
    paymentSchedules?: NewEstimatePaymentSchedule[],
  ): Promise<Estimate> {
    try {
      // If line items are provided, recalculate subtotal and total
      if (lineItems) {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

        // Calculate total with discount
        let totalAmount = subtotal
        if (updates.discount_type === "percentage" && updates.discount_value) {
          totalAmount = subtotal * (1 - updates.discount_value / 100)
        } else if (updates.discount_type === "fixed" && updates.discount_value) {
          totalAmount = subtotal - updates.discount_value
        }

        // Ensure total is not negative
        totalAmount = Math.max(0, totalAmount)

        updates = {
          ...updates,
          subtotal_amount: subtotal,
          total_amount: totalAmount,
        }
      }

      const { data, error } = await supabase
        .from("estimates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // If line items are provided, replace all existing ones
      if (lineItems) {
        // Delete existing line items
        const { error: deleteError } = await supabase.from("estimate_line_items").delete().eq("estimate_id", id)

        if (deleteError) throw deleteError

        // Insert new line items
        if (lineItems.length > 0) {
          const itemsWithEstimateId = lineItems.map((item, index) => ({
            ...item,
            estimate_id: id,
            sort_order: index,
          }))

          const { error: insertError } = await supabase.from("estimate_line_items").insert(itemsWithEstimateId)

          if (insertError) throw insertError
        }
      }

      // If payment schedules are provided, replace all existing ones
      if (paymentSchedules) {
        // Delete existing payment schedules
        const { error: deleteError } = await supabase.from("estimate_payment_schedules").delete().eq("estimate_id", id)

        if (deleteError) throw deleteError

        // Insert new payment schedules
        if (paymentSchedules.length > 0) {
          const schedulesWithEstimateId = paymentSchedules.map((schedule, index) => ({
            ...schedule,
            estimate_id: id,
            sort_order: index,
          }))

          const { error: insertError } = await supabase
            .from("estimate_payment_schedules")
            .insert(schedulesWithEstimateId)

          if (insertError) throw insertError
        }
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteEstimate(id: string): Promise<void> {
    try {
      // Line items and payment schedules will be deleted automatically due to CASCADE constraint
      const { error } = await supabase.from("estimates").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Line item methods
  async getEstimateLineItems(estimateId: string): Promise<EstimateLineItem[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select("*")
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getLineItemsBySection(estimateId: string): Promise<LineItemsBySection> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select(`
          *,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error

      // Group by section
      const sections: LineItemsBySection = {}

      // Default section for items without a section
      const defaultSection = "General"

      if (data) {
        data.forEach((item) => {
          const sectionName = item.section_name || defaultSection
          if (!sections[sectionName]) {
            sections[sectionName] = []
          }
          sections[sectionName].push(item)
        })
      }

      return sections
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addLineItem(lineItem: NewEstimateLineItem): Promise<EstimateLineItem> {
    try {
      // Get the current highest sort order
      const { data: existingItems, error: countError } = await supabase
        .from("estimate_line_items")
        .select("sort_order")
        .eq("estimate_id", lineItem.estimate_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (countError) throw countError

      const sortOrder = existingItems && existingItems.length > 0 ? existingItems[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from("estimate_line_items")
        .insert({ ...lineItem, sort_order: sortOrder })
        .select()
        .single()

      if (error) throw error

      // Update the estimate total
      await this.updateEstimateTotal(lineItem.estimate_id)

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateLineItem(id: string, updates: UpdateEstimateLineItem): Promise<EstimateLineItem> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Update the estimate total
      if (data.estimate_id) {
        await this.updateEstimateTotal(data.estimate_id)
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteLineItem(id: string): Promise<void> {
    try {
      // Get the estimate_id before deleting
      const { data: lineItem, error: getError } = await supabase
        .from("estimate_line_items")
        .select("estimate_id")
        .eq("id", id)
        .single()

      if (getError) throw getError

      const { error } = await supabase.from("estimate_line_items").delete().eq("id", id)

      if (error) throw error

      // Update the estimate total
      if (lineItem) {
        await this.updateEstimateTotal(lineItem.estimate_id)
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateEstimateTotal(estimateId: string): Promise<void> {
    try {
      // Calculate the subtotal from all line items
      const { data: lineItems, error: itemsError } = await supabase
        .from("estimate_line_items")
        .select("total")
        .eq("estimate_id", estimateId)

      if (itemsError) throw itemsError

      const subtotalAmount = lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0

      // Get the current discount settings
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select("discount_type, discount_value")
        .eq("id", estimateId)
        .single()

      if (estimateError) throw estimateError

      // Calculate total with discount
      let totalAmount = subtotalAmount
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotalAmount * (1 - estimate.discount_value / 100)
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotalAmount - estimate.discount_value
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount)

      // Update the estimate with the new total
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", estimateId)

      if (updateError) throw updateError
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Payment schedule methods
  async getPaymentSchedules(estimateId: string): Promise<EstimatePaymentSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .select("*")
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addPaymentSchedule(schedule: NewEstimatePaymentSchedule): Promise<EstimatePaymentSchedule> {
    try {
      // Get the current highest sort order
      const { data: existingSchedules, error: countError } = await supabase
        .from("estimate_payment_schedules")
        .select("sort_order")
        .eq("estimate_id", schedule.estimate_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (countError) throw countError

      const sortOrder = existingSchedules && existingSchedules.length > 0 ? existingSchedules[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .insert({ ...schedule, sort_order: sortOrder })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePaymentSchedule(id: string, updates: UpdateEstimatePaymentSchedule): Promise<EstimatePaymentSchedule> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
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

  async deletePaymentSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("estimate_payment_schedules").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper to generate a unique estimate number
  async generateEstimateNumber(): Promise<string> {
    const prefix = "EST"
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    // Get the latest estimate number with this prefix
    const { data, error } = await supabase
      .from("estimates")
      .select("estimate_number")
      .ilike("estimate_number", `${prefix}${year}${month}%`)
      .order("estimate_number", { ascending: false })
      .limit(1)

    if (error) throw error

    let sequence = 1
    if (data && data.length > 0 && data[0].estimate_number) {
      // Extract the sequence number from the latest estimate number
      const latestSequence = Number.parseInt(data[0].estimate_number.slice(-4), 10)
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1
      }
    }

    return `${prefix}${year}${month}${sequence.toString().padStart(4, "0")}`
  },
}
