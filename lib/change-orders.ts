import { supabase, handleSupabaseError } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export type ChangeOrderStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Implemented" | "Canceled"

import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";

export type ChangeOrderLineItem = Tables<"change_order_line_items">;
export type NewChangeOrderLineItem = TablesInsert<"change_order_line_items">;
export type UpdateChangeOrderLineItem = TablesUpdate<"change_order_line_items">;

// person_id is not a direct column of change_orders table.
// It should be derived via project_id -> projects.person_id if needed.
// For simplicity in the service, we'll work with the direct table columns.
export type ChangeOrder = Tables<"change_orders"> & {
  line_items: ChangeOrderLineItem[];
  // If person_id is needed for display, it should be added separately after fetching,
  // e.g., by joining with projects table and then people table.
};
export type NewChangeOrder = TablesInsert<"change_orders"> & {
  line_items: NewChangeOrderLineItem[];
  // person_id is not part of change_orders insert type
};
export type UpdateChangeOrder = TablesUpdate<"change_orders"> & {
  line_items?: UpdateChangeOrderLineItem[];
  // person_id is not part of change_orders update type
};

export interface ChangeOrderWithProject extends Tables<"change_orders"> {
  line_items: ChangeOrderLineItem[];
  project: {
    id: string
    project_name: string
  }
}

export const changeOrderService = {
  async getChangeOrders() {
    try {
      const { data, error } = await supabase
        .from("change_orders")
        .select(`
          id,
          project_id,
          // person_id, -- Removed as it's not on the table
          change_order_number,
          status,
          title,
          description,
          reason,
          requested_by,
          issue_date,
          approval_date,
          total_amount,
          impact_on_timeline,
          created_by_user_id,
          created_at,
          updated_at,
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
  },

  async getChangeOrderById(id: string) {
    try {
      // Fetch the change order
      const { data: changeOrder, error: changeOrderError } = await supabase
        .from("change_orders")
        .select(`
          id,
          project_id,
          // person_id, -- Removed as it's not on the table
          change_order_number,
          status,
          title,
          description,
          reason,
          requested_by,
          issue_date,
          approval_date,
          total_amount,
          impact_on_timeline,
          created_by_user_id,
          created_at,
          updated_at,
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
        .select(`
          id,
          change_order_id,
          cost_item_id,
          description,
          quantity,
          unit,
          unit_price,
          total,
          sort_order,
          is_billed,
          invoice_line_item_id,
          // Explicitly list all fields from the table if needed
          has_bids,
          trade_category,
          created_at,
          updated_at
        `)
        .eq("change_order_id", id)
        .order("sort_order", { ascending: true })

      if (lineItemsError) {
        throw lineItemsError
      }

      if (!changeOrder) {
        return null;
      }
      
      return {
        ...changeOrder as unknown as Tables<"change_orders">,
        line_items: lineItems || [],
      }
    } catch (error) {
      console.error("Error fetching change order:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getNextChangeOrderNumber() {
    try {
      const { data, error } = await supabase
        .from("change_orders")
        .select("change_order_number")
        .order("created_at", { ascending: false })
        .limit(1)

      if (error) {
        throw error
      }

      if (data && data.length > 0 && data[0].change_order_number) {
        // Extract the numeric part of the change order number
        const match = data[0].change_order_number.match(/CO-(\d+)/)
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
  },

  async createChangeOrder(changeOrder: NewChangeOrder) {
    try {
      const changeOrderId = uuidv4() // ID is auto-generated by DB or should be if not provided
      const now = new Date().toISOString()

      const { line_items: inputLineItems, ...coInsertData } = changeOrder;

      // Create the change order
      // Ensure coInsertData matches TablesInsert<"change_orders">
      const changeOrderPayload: TablesInsert<"change_orders"> = {
        ...coInsertData,
        id: changeOrderId, // If you want to control UUID generation
        created_at: now,
        updated_at: now,
      };

      const { data: createdCO, error: changeOrderError } = await supabase
        .from("change_orders")
        .insert(changeOrderPayload)
        .select()
        .single();

      if (changeOrderError || !createdCO) {
        throw changeOrderError || new Error("Failed to create change order record.");
      }

      // Create the line items
      if (inputLineItems && inputLineItems.length > 0) {
        const lineItemsToInsert = inputLineItems.map((item, index) => ({
          // id is optional in NewChangeOrderLineItem, let the database generate it
          change_order_id: changeOrderId,
          cost_item_id: item.cost_item_id !== undefined ? item.cost_item_id : null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
          sort_order: item.sort_order !== undefined ? item.sort_order : index,
          is_billed: item.is_billed !== undefined ? item.is_billed : false,
          invoice_line_item_id: item.invoice_line_item_id !== undefined ? item.invoice_line_item_id : null,
          has_bids: item.has_bids !== undefined ? item.has_bids : null,
          trade_category: item.trade_category !== undefined ? item.trade_category : null,
          created_at: now,
          updated_at: now
        }));

        const { error: lineItemsError } = await supabase.from("change_order_line_items").insert(lineItemsToInsert as unknown as TablesInsert<"change_order_line_items">[])

        if (lineItemsError) {
          throw lineItemsError
        }
      }

      return changeOrderId
    } catch (error) {
      console.error("Error creating change order:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateChangeOrder(id: string, changeOrderUpdates: UpdateChangeOrder) {
    try {
      const now = new Date().toISOString()
      const { line_items: updatedLineItems, ...coUpdateData } = changeOrderUpdates;

      // Update the change order
      // Ensure coUpdateData matches TablesUpdate<"change_orders">
      const changeOrderUpdatePayload: TablesUpdate<"change_orders"> = {
        ...coUpdateData,
        updated_at: now,
      };

      const { data: updatedCO, error: changeOrderError } = await supabase
        .from("change_orders")
        .update(changeOrderUpdatePayload)
        .eq("id", id)
        .select()
        .single();

      if (changeOrderError || !updatedCO) {
        throw changeOrderError || new Error("Failed to update change order or retrieve updated record.");
      }

      // Handle line items: diffing would be more robust, but for now, replace
      if (updatedLineItems) {
        // Delete existing line items
        const { error: deleteError } = await supabase.from("change_order_line_items").delete().eq("change_order_id", id)

        if (deleteError) {
          throw deleteError
        }

        // Create new line items
        if (updatedLineItems.length > 0) {
          const lineItemsToInsert = updatedLineItems.map((item: UpdateChangeOrderLineItem, index) => ({
            id: undefined, // Let the database generate the ID
            change_order_id: id,
            cost_item_id: item.cost_item_id ?? null,
            description: item.description!, 
            quantity: item.quantity!, 
            unit: item.unit!, 
            unit_price: item.unit_price!, 
            total: item.total!, 
            sort_order: item.sort_order ?? index,
            is_billed: item.is_billed ?? false,
            invoice_line_item_id: item.invoice_line_item_id ?? null,
            has_bids: item.has_bids ?? null,
            trade_category: item.trade_category ?? null,
          }));
          const { error: lineItemsError } = await supabase.from("change_order_line_items").insert(lineItemsToInsert as unknown as TablesInsert<"change_order_line_items">[]);
          if (lineItemsError) {
            throw lineItemsError;
          }
        }
      } // End of if (updatedLineItems)
      return id; // This should be here, at the end of the try block
    } catch (error) {
      console.error("Error updating change order:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteChangeOrder(id: string) {
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
  },

  async updateChangeOrderLineItem(id: string, updates: UpdateChangeOrderLineItem) {
    try {
      const { data, error } = await supabase
        .from("change_order_line_items")
        .update(updates as TablesUpdate<"change_order_line_items">) // Explicit cast
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }
      return data as ChangeOrderLineItem; // Cast to specific type
    } catch (error) {
      console.error("Error updating change order line item:", error);
      throw new Error(handleSupabaseError(error));
    }
  }
}
