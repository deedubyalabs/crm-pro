import { supabase, handleSupabaseError } from "./supabase";
import type {
  EstimateLineItem,
  NewEstimateLineItem,
  UpdateEstimateLineItem,
} from "@/types/estimates";
import type { BidLineItem } from "@/types/bidding";

// Define LineItemsBySection type locally
type LineItemsBySection = {
  [sectionName: string]: EstimateLineItem[];
};

export const estimateLineItemService = {
  async getEstimateLineItems(estimateId: string): Promise<EstimateLineItem[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select(`
          id,
          estimate_id,
          cost_item_id,
          description,
          quantity,
          unit,
          unit_cost,
          markup,
          total,
          sort_order,
          section_name,
          is_optional,
          is_taxable,
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order");

      if (error) throw error;
      return (data || []) as unknown as EstimateLineItem[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getLineItemsBySection(estimateId: string): Promise<LineItemsBySection> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select(`
          id,
          estimate_id,
          cost_item_id,
          description,
          quantity,
          unit,
          unit_cost,
          markup,
          total,
          sort_order,
          section_name,
          is_optional,
          is_taxable,
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order");

      if (error) throw error;
      const typedData = data as unknown as EstimateLineItem[];

      // Group by section
      const sections: LineItemsBySection = {};

      // Default section for items without a section
      const defaultSection = "General";

      if (typedData) {
        typedData.forEach((item) => {
          const sectionName = item.section_name || defaultSection;
          if (!sections[sectionName]) {
            sections[sectionName] = [];
          }
          sections[sectionName].push(item);
        });
      }

      return sections;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
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
        .limit(1);

      if (countError) throw countError;

      const sortOrder = existingItems && existingItems.length > 0 ? existingItems[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from("estimate_line_items")
        .insert({ ...lineItem, sort_order: sortOrder } as any) // Cast to any
        .select(`
          id,
          estimate_id,
          cost_item_id,
          description,
          quantity,
          unit,
          unit_cost,
          markup,
          total,
          sort_order,
          section_name,
          is_optional,
          is_taxable,
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .single();

      if (error) throw error;

      // Update the estimate total
      await this.updateEstimateTotal(lineItem.estimate_id);

      return data as unknown as EstimateLineItem;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateLineItem(id: string, updates: UpdateEstimateLineItem): Promise<EstimateLineItem> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .update({ ...updates, updated_at: new Date().toISOString() } as any) // Cast to any
        .eq("id", id)
        .select(`
          id,
          estimate_id,
          cost_item_id,
          description,
          quantity,
          unit,
          unit_cost,
          markup,
          total,
          sort_order,
          section_name,
          is_optional,
          is_taxable,
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .single();

      if (error) throw error;

      // Update the estimate total
      // Type cast the data to include estimate_id
      const typedData = data as unknown as EstimateLineItem;
      if (typedData.estimate_id) {
        await this.updateEstimateTotal(typedData.estimate_id);
      }

      return data as unknown as EstimateLineItem;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteLineItem(id: string): Promise<void> {
    try {
      // Get the estimate_id before deleting
      const { data, error: getError } = await supabase
        .from("estimate_line_items")
        .select("estimate_id")
        .eq("id", id)
        .single();

      if (getError) throw getError;
      // @ts-ignore: Supabase type inference issue with SelectQueryError
      const estimateIdToDelete = (data as { estimate_id: string }).estimate_id;

      const { error } = await supabase.from("estimate_line_items").delete().eq("id", id);

      if (error) throw error;

      // Update the estimate total
      if (estimateIdToDelete) {
        await this.updateEstimateTotal(estimateIdToDelete);
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateEstimateLineItemsFromAwardedBid(estimateId: string, bidLineItems: BidLineItem[]): Promise<void> {
    try {
      const { data, error: fetchError } = await supabase
        .from("estimate_line_items")
        .select("id, description, quantity, unit, unit_price, total, sort_order")
        .eq("estimate_id", estimateId)
        .order("sort_order");

      const currentLineItems = data as unknown as EstimateLineItem[];

      if (fetchError) throw fetchError;
      if (!currentLineItems || currentLineItems.length === 0) {
        console.warn(`No line items found for estimate ID ${estimateId}. Cannot update from awarded bid.`);
        return;
      }

      const updates = currentLineItems.map(currentLineItem => {
        // Find a matching bid line item by description (case-insensitive for robustness)
        const matchingBidLineItem = bidLineItems.find(
          bidItem => bidItem.description.toLowerCase() === currentLineItem.description.toLowerCase()
        );

        if (matchingBidLineItem) {
          // Update unit_price and recalculate total
          const newUnitPrice = matchingBidLineItem.unit_price;
          const newTotal = currentLineItem.quantity * newUnitPrice;

          return {
            id: currentLineItem.id,
            unit_price: newUnitPrice,
            total: newTotal,
            updated_at: new Date().toISOString(),
          };
        }
        return null; // No match, no update needed for this line item
      }).filter(item => item !== null); // Remove nulls

      if (updates.length > 0) {
        const { error: updateError } = await supabase
          .from("estimate_line_items")
          .upsert(updates as any, { onConflict: "id" }); // Use upsert to update existing records

        if (updateError) throw updateError;
        console.log(`Updated ${updates.length} estimate line items for estimate ID ${estimateId}`);

        // After updating line items, recalculate the estimate total
        await this.updateEstimateTotal(estimateId);
      } else {
        console.log(`No matching bid line items found to update estimate ID ${estimateId}`);
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateEstimateTotal(estimateId: string): Promise<void> {
    try {
      // Calculate the subtotal from all line items
      const { data: lineItems, error: itemsError } = await supabase
        .from("estimate_line_items")
        .select("total")
        .eq("estimate_id", estimateId);

      if (itemsError) throw itemsError;

      const subtotalAmount = lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;

      // Get the current discount settings
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select("discount_type, discount_value")
        .eq("id", estimateId)
        .single();

      if (estimateError) throw estimateError;

      // Calculate total with discount
      let totalAmount = subtotalAmount;
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotalAmount * (1 - estimate.discount_value / 100);
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotalAmount - estimate.discount_value;
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount);

      // Update the estimate with the new total
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", estimateId);

      if (updateError) throw updateError;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },
};
