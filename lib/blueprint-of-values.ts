import { supabase, handleSupabaseError } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { EstimateLineItem } from "@/types/estimates";
import { BlueprintOfValues, BlueprintOfValuesItem, NewBlueprintOfValues, NewBlueprintOfValuesItem, BlueprintOfValuesWithItems } from "@/types/blueprint-of-values";

export const blueprintOfValuesService = {
  async createBlueprintOfValues(bov: NewBlueprintOfValues, items: NewBlueprintOfValuesItem[] = []): Promise<BlueprintOfValues> {
    try {
      const bovId = uuidv4(); // Removed bov.id as it's omitted in NewBlueprintOfValues
      const now = new Date().toISOString();

      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      const { data, error } = await supabase.from("blueprint_of_values").insert({
        ...bov,
        id: bovId,
        total_amount: totalAmount,
        created_at: now,
        updated_at: now,
      }).select().single();

      if (error) throw error;

      const createdBov = data as BlueprintOfValues;

      if (items.length > 0) {
        const bovItems = items.map((item, index) => ({
          id: uuidv4(), // Removed item.id as it's omitted in NewBlueprintOfValuesItem
          bov_id: createdBov.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.quantity * item.unit_price,
          is_billed: item.is_billed,
          invoice_line_item_id: item.invoice_line_item_id,
          linked_estimate_line_item_id: item.linked_estimate_line_item_id,
          linked_change_order_line_item_id: item.linked_change_order_line_item_id,
          sort_order: item.sort_order || index,
          created_at: now,
          updated_at: now,
        }));

        const { error: itemsError } = await supabase.from("project_values_blueprint_items").insert(pvbItems);
        if (itemsError) throw itemsError;
      }

      return createdBov;
    } catch (error) {
      console.error("Error creating Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getBlueprintOfValuesByProjectId(projectId: string): Promise<BlueprintOfValuesWithItems[]> {
    try {
      const { data, error } = await supabase
        .from("blueprint_of_values")
        .select(`
          id,
          bov_number,
          name,
          status,
          project_id,
          items:blueprint_of_values_items (
            id,
            description,
            quantity,
            unit,
            unit_price,
            total
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []) as unknown as BlueprintOfValuesWithItems[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getBlueprintOfValuesById(id: string): Promise<BlueprintOfValues | null> {
    try {
      const { data, error } = await supabase
        .from("blueprint_of_values")
        .select(`*, items:blueprint_of_values_items(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlueprintOfValues;
    } catch (error) {
      console.error("Error fetching Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async convertEstimateToBlueprintOfValues(estimateId: string, userId: string | null): Promise<BlueprintOfValues> {
    try {
      // Fetch estimate and its line items, explicitly selecting all required fields for EstimateLineItem
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select(`
          *,
          line_items:estimate_line_items(
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
            notes,
            is_optional,
            is_taxable,
            assigned_to_user_id,
            created_at,
            updated_at
          )
        `)
        .eq("id", estimateId)
        .single();

      if (estimateError) throw estimateError;
      if (!estimate) throw new Error("Estimate not found.");

      const newBov: NewBlueprintOfValues = {
        project_id: estimate.project_id,
        estimate_id: estimate.id,
        name: `BOV for Estimate ${estimate.estimate_number}`,
        status: "Draft",
      };

      // Explicitly cast estimate.line_items to EstimateLineItem[]
      const typedEstimateLineItems = estimate.line_items as unknown as EstimateLineItem[];

      const bovItems: NewBlueprintOfValuesItem[] = typedEstimateLineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_cost, // Assuming unit_cost from estimate becomes unit_price for BOV
        is_billed: false,
        invoice_line_item_id: null,
        linked_estimate_line_item_id: item.id,
        linked_change_order_line_item_id: null,
        sort_order: item.sort_order,
        bov_id: "", // Will be filled by createBlueprintOfValues
      }));

      const createdBov = await this.createBlueprintOfValues(newBov, bovItems);

      // Update the estimate to mark it as converted to BOV
      await supabase.from("estimates").update({
        is_converted_to_bov: true,
        updated_at: new Date().toISOString(),
      }).eq("id", estimateId);

      return createdBov;
    } catch (error) {
      console.error("Error converting estimate to Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },
};
