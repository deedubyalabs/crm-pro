import { supabase, handleSupabaseError } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export type ChangeOrderStatus = "Requested" | "Pending" | "Approved" | "Rejected" | "Completed"

export interface ChangeOrderLineItem {
  id?: string
  change_order_id?: string
  cost_item_id?: string
  description: string
  quantity: number
  unit: string
  unit_cost: number
  markup: number
  total: number
  sort_order: number
}

export interface ChangeOrder {
  id?: string
  project_id: string
  person_id: string
  co_number?: string
  status: ChangeOrderStatus
  description: string
  reason?: string
  cost_impact: number
  time_impact_days?: number
  approved_by_person_id?: string
  approved_at?: string
  created_by_user_id?: string
  created_at?: string
  updated_at?: string
  line_items: ChangeOrderLineItem[]
}

export interface ChangeOrderWithProject extends ChangeOrder {
  project: {
    id: string
    project_name: string
  }
}

export async function getChangeOrders() {
  try {
    const { data, error } = await supabase
      .from("change_orders")
      .select(`
        *,
        project:projects(id, project_name)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching change orders:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getChangeOrderById(id: string) {
  try {
    // Fetch the change order
    const { data: changeOrder, error: changeOrderError } = await supabase
      .from("change_orders")
      .select(`
        *,
        project:projects(id, project_name)
      `)
      .eq("id", id)
      .single()

    if (changeOrderError) {
      throw changeOrderError
    }

    if (!changeOrder) {
      return null
    }

    // Fetch the line items
    const { data: lineItems, error: lineItemsError } = await supabase
      .from("change_order_line_items")
      .select("*")
      .eq("change_order_id", id)
      .order("sort_order", { ascending: true })

    if (lineItemsError) {
      throw lineItemsError
    }

    return {
      ...changeOrder,
      line_items: lineItems || [],
    }
  } catch (error) {
    console.error("Error fetching change order:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getNextChangeOrderNumber() {
  try {
    const { data, error } = await supabase
      .from("change_orders")
      .select("co_number")
      .order("created_at", { ascending: false })
      .limit(1)

    if (error) {
      throw error
    }

    if (data && data.length > 0 && data[0].co_number) {
      // Extract the numeric part of the change order number
      const match = data[0].co_number.match(/CO-(\d+)/)
      if (match && match[1]) {
        const nextNumber = Number.parseInt(match[1], 10) + 1
        return `CO-${nextNumber.toString().padStart(5, "0")}`
      }
    }

    // Default to CO-00001 if no change orders exist
    return "CO-00001"
  } catch (error) {
    console.error("Error getting next change order number:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function createChangeOrder(changeOrder: ChangeOrder) {
  try {
    const changeOrderId = changeOrder.id || uuidv4()
    const now = new Date().toISOString()

    // Create the change order
    const { error: changeOrderError } = await supabase.from("change_orders").insert({
      id: changeOrderId,
      project_id: changeOrder.project_id,
      person_id: changeOrder.person_id,
      co_number: changeOrder.co_number,
      status: changeOrder.status,
      description: changeOrder.description,
      reason: changeOrder.reason,
      cost_impact: changeOrder.cost_impact,
      time_impact_days: changeOrder.time_impact_days,
      approved_by_person_id: changeOrder.approved_by_person_id,
      approved_at: changeOrder.approved_at,
      created_by_user_id: changeOrder.created_by_user_id,
      created_at: now,
      updated_at: now,
    })

    if (changeOrderError) {
      throw changeOrderError
    }

    // Create the line items
    if (changeOrder.line_items && changeOrder.line_items.length > 0) {
      const lineItems = changeOrder.line_items.map((item, index) => ({
        id: item.id || uuidv4(),
        change_order_id: changeOrderId,
        cost_item_id: item.cost_item_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        markup: item.markup,
        total: item.total,
        sort_order: item.sort_order || index,
        created_at: now,
        updated_at: now,
      }))

      const { error: lineItemsError } = await supabase.from("change_order_line_items").insert(lineItems)

      if (lineItemsError) {
        throw lineItemsError
      }
    }

    return changeOrderId
  } catch (error) {
    console.error("Error creating change order:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateChangeOrder(id: string, changeOrder: ChangeOrder) {
  try {
    const now = new Date().toISOString()

    // Update the change order
    const { error: changeOrderError } = await supabase
      .from("change_orders")
      .update({
        project_id: changeOrder.project_id,
        person_id: changeOrder.person_id,
        co_number: changeOrder.co_number,
        status: changeOrder.status,
        description: changeOrder.description,
        reason: changeOrder.reason,
        cost_impact: changeOrder.cost_impact,
        time_impact_days: changeOrder.time_impact_days,
        approved_by_person_id: changeOrder.approved_by_person_id,
        approved_at: changeOrder.approved_at,
        updated_at: now,
      })
      .eq("id", id)

    if (changeOrderError) {
      throw changeOrderError
    }

    // Delete existing line items
    const { error: deleteError } = await supabase.from("change_order_line_items").delete().eq("change_order_id", id)

    if (deleteError) {
      throw deleteError
    }

    // Create new line items
    if (changeOrder.line_items && changeOrder.line_items.length > 0) {
      const lineItems = changeOrder.line_items.map((item, index) => ({
        id: item.id || uuidv4(),
        change_order_id: id,
        cost_item_id: item.cost_item_id,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_cost: item.unit_cost,
        markup: item.markup,
        total: item.total,
        sort_order: item.sort_order || index,
        created_at: now,
        updated_at: now,
      }))

      const { error: lineItemsError } = await supabase.from("change_order_line_items").insert(lineItems)

      if (lineItemsError) {
        throw lineItemsError
      }
    }

    return id
  } catch (error) {
    console.error("Error updating change order:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteChangeOrder(id: string) {
  try {
    // Delete line items first
    const { error: lineItemsError } = await supabase.from("change_order_line_items").delete().eq("change_order_id", id)

    if (lineItemsError) {
      throw lineItemsError
    }

    // Delete the change order
    const { error: changeOrderError } = await supabase.from("change_orders").delete().eq("id", id)

    if (changeOrderError) {
      throw changeOrderError
    }

    return true
  } catch (error) {
    console.error("Error deleting change order:", error)
    throw new Error(handleSupabaseError(error))
  }
}
