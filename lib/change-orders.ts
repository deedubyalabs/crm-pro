import { supabase, handleSupabaseError } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

export type ChangeOrderStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Implemented" | "Canceled"

import type { Tables, TablesInsert, TablesUpdate } from "@/types/supabase";
import { ChangeOrderWithDetails as ChangeOrderWithDetailsType } from "@/types/change-orders"; // Import from types

export type ChangeOrderLineItem = Tables<"change_order_line_items">;
export type NewChangeOrderLineItem = Omit<TablesInsert<"change_order_line_items">, "change_order_id" | "id">; // Omit change_order_id and id
export type UpdateChangeOrderLineItem = TablesUpdate<"change_order_line_items"> & {
  cost_item_id?: string | null; // Add cost_item_id
};

export type ChangeOrder = Tables<"change_orders"> & {
  line_items: ChangeOrderLineItem[];
};

// Explicitly define NewChangeOrder to match form data and database schema
export type NewChangeOrder = {
  project_id: string;
  person_id: string | null; // Changed to nullable based on schema
  change_order_number?: string | null;
  status: ChangeOrderStatus;
  title: string;
  description: string; // Changed to required string based on schema
  reason?: string | null;
  requested_by?: string | null;
  total_amount: number;
  impact_on_timeline?: number | null;
  approved_by_person_id?: string | null;
  created_by_user_id?: string | null;
  line_items: NewChangeOrderLineItem[];
};

// Explicitly define UpdateChangeOrder to match form data and database schema
export type UpdateChangeOrder = {
  project_id?: string;
  person_id?: string | null; // Changed to nullable based on schema
  change_order_number?: string | null;
  status?: ChangeOrderStatus;
  title?: string;
  description?: string; // Changed to required string based on schema
  reason?: string | null;
  requested_by?: string | null;
  total_amount?: number;
  impact_on_timeline?: number | null;
  approved_by_person_id?: string | null;
  created_by_user_id?: string | null;
  line_items?: UpdateChangeOrderLineItem[];
};

export interface ChangeOrderWithProject extends Tables<"change_orders"> {
  line_items: ChangeOrderLineItem[];
  project: {
    id: string
    project_name: string
  }
}

// Re-export ChangeOrderWithDetails from types/change-orders.ts
export type ChangeOrderWithDetails = ChangeOrderWithDetailsType;

export const changeOrderService = {
  async getChangeOrders() {
    try {
      const { data, error } = await supabase
        .from("change_orders")
        .select(`
          id,
          project_id,
          person_id,
          change_order_number,
          status,
          title,
          description,
          reason,
          requested_by,
          total_amount,
          impact_on_timeline,
          approved_by_person_id,
          created_at,
          updated_at,
          project:projects(id, project_name),
          line_items:change_order_line_items(*)
        `) // Added line_items to the select
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
          person_id,
          change_order_number,
          status,
          title,
          description,
          reason,
          requested_by,
          total_amount,
          impact_on_timeline,
          approved_by_person_id,
          created_at,
          updated_at,
          project:projects(id, project_name),
          line_items:change_order_line_items(
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
            has_bids,
            trade_category,
            created_at,
            updated_at
          )
        `)
        .eq("id", id)
        .single()

      if (changeOrderError) {
        throw changeOrderError
      }

      if (!changeOrder) {
        return null;
      }
      
      return changeOrder as unknown as ChangeOrderWithDetails;
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

      const { line_items: inputLineItems, ...coData } = changeOrder;

      // Create the change order
      const changeOrderPayload: TablesInsert<"change_orders"> = {
        id: uuidv4(),
        created_at: now,
        updated_at: now,
        project_id: (coData as any).project_id,
        person_id: (coData as any).person_id ?? null,
        change_order_number: (coData as any).change_order_number ?? null,
        status: (coData as any).status,
        title: (coData as any).title,
        description: (coData as any).description,
        reason: (coData as any).reason ?? null,
        requested_by: (coData as any).requested_by ?? null,
        total_amount: (coData as any).total_amount,
        impact_on_timeline: (coData as any).impact_on_timeline ?? null,
        approved_by_person_id: (coData as any).approved_by_person_id ?? null,
      };

      const { data: createdCO, error: changeOrderError } = await supabase
        .from("change_orders")
        .insert(changeOrderPayload)
        .select()
        .single();

      if (changeOrderError || !createdCO) {
        throw changeOrderError || new Error("Failed to create change order record.");
      }

      // Create the line items, linking them to the newly created change order
      if (inputLineItems && inputLineItems.length > 0) {
        const lineItemsToInsert = inputLineItems.map((item, index) => ({
          ...item,
          change_order_id: createdCO.id, // Assign the new change_order_id
          id: uuidv4(), // Generate ID for line item
          sort_order: item.sort_order !== undefined ? item.sort_order : index,
          is_billed: item.is_billed !== undefined ? item.is_billed : false,
          invoice_line_item_id: item.invoice_line_item_id !== undefined ? item.invoice_line_item_id : null,
          created_at: now,
          updated_at: now,
          // Ensure all required fields are present or have defaults
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
          // markup is not a database column, so it's not included here
        }));

        const { error: lineItemsError } = await supabase.from("change_order_line_items").insert(lineItemsToInsert as TablesInsert<"change_order_line_items">[])

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
      // Create payload and filter out undefined values
      const basePayload = {
        updated_at: now,
        ...(coUpdateData as any), // Cast coUpdateData to any here
        created_by_user_id: undefined, // Ensure this is not sent in update
      };
      
      // Explicitly cast the entire payload to TablesUpdate<"change_orders">
      const changeOrderUpdatePayload = basePayload as TablesUpdate<"change_orders">;

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
          const lineItemsToInsert = updatedLineItems.map((item, index) => ({
            id: undefined, // Let the database generate the ID
            change_order_id: id,
            cost_item_id: item.cost_item_id ?? null, // Now exists on UpdateChangeOrderLineItem
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
