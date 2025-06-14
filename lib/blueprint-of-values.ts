import { supabase, handleSupabaseError } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { EstimateLineItem } from "@/types/estimates";
import { BlueprintOfValue, BlueprintOfValueLineItem, NewBlueprintOfValue, NewBlueprintOfValueLineItem, BlueprintOfValueWithItems } from "@/types/blueprint-of-values";

export const blueprintOfValuesService = {
  async createBlueprintOfValues(bov: NewBlueprintOfValue, items: NewBlueprintOfValueLineItem[] = []): Promise<BlueprintOfValue> {
    try {
      const bovId = uuidv4();
      const now = new Date().toISOString();

      const { data, error } = await supabase.from("blueprint_of_values").insert({
        ...bov,
        id: bovId,
        created_at: now,
        updated_at: now,
      }).select().single();

      if (error) throw error;

      const createdBov = data as BlueprintOfValue;

      if (items.length > 0) {
        const bovItems = items.map((item, index) => ({
          ...item, // Spread existing properties
          id: uuidv4(),
          bov_id: createdBov.id,
          created_at: now,
          updated_at: now,
          // Ensure default values for optional fields if not provided
          amount_previously_billed: item.amount_previously_billed ?? 0,
          percent_previously_billed: item.percent_previously_billed ?? 0,
          remaining_to_bill: item.remaining_to_bill ?? item.scheduled_value, // Default to scheduled_value
        }));

        const { error: itemsError } = await supabase.from("blueprint_of_value_line_items").insert(bovItems);
        if (itemsError) throw itemsError;
      }

      return createdBov;
    } catch (error) {
      console.error("Error creating Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getBlueprintOfValuesByProjectId(projectId: string): Promise<BlueprintOfValueWithItems[]> {
    try {
      const { data, error } = await supabase
        .from("blueprint_of_values")
        .select(`
          id,
          bov_number,
          name,
          status,
          project_id,
          estimate_id,
          items:blueprint_of_value_line_items (
            id,
            item_name,
            description,
            scheduled_value,
            amount_previously_billed,
            remaining_to_bill,
            percent_previously_billed,
            estimate_line_item_id
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []) as unknown as BlueprintOfValueWithItems[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getBlueprintOfValuesById(id: string): Promise<BlueprintOfValue | null> {
    try {
      const { data, error } = await supabase
        .from("blueprint_of_values")
        .select(`*, items:blueprint_of_value_line_items(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as BlueprintOfValue;
    } catch (error) {
      console.error("Error fetching Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async convertEstimateToBlueprintOfValues(estimateId: string, userId: string | null): Promise<BlueprintOfValue> {
    try {
      // Fetch estimate and its line items, explicitly selecting all required fields for EstimateLineItem
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select(`
          *,
          line_items:estimate_line_items(
            id,
            description,
            total,
            sort_order
          )
        `)
        .eq("id", estimateId)
        .single();

      if (estimateError) throw estimateError;
      if (!estimate) throw new Error("Estimate not found.");

      const newBov: NewBlueprintOfValue = {
        project_id: estimate.project_id,
        estimate_id: estimate.id,
        name: `BOV for Estimate ${estimate.estimate_number}`,
        status: "Draft",
        bov_number: await this.generateBovNumber(), // Generate a new BOV number
      };

      // Explicitly cast estimate.line_items to EstimateLineItem[]
      const typedEstimateLineItems = estimate.line_items as unknown as EstimateLineItem[];

      const bovItems: NewBlueprintOfValueLineItem[] = typedEstimateLineItems.map((item) => ({
        item_name: item.description, // Use description as item_name
        description: item.description,
        scheduled_value: item.total, // Use total from estimate line item as scheduled_value
        amount_previously_billed: 0,
        remaining_to_bill: item.total, // Initially, remaining to bill is the scheduled value
        percent_previously_billed: 0,
        estimate_line_item_id: item.id,
        bov_id: "", // Will be filled by createBlueprintOfValues
      }));

      const createdBov = await this.createBlueprintOfValues(newBov, bovItems);

      // Update the estimate to mark it as converted to BOV
      await supabase.from("estimates").update({
        is_converted_to_bov: true,
        blueprint_of_values_id: createdBov.id, // Link the created BOV to the estimate
        updated_at: new Date().toISOString(),
      }).eq("id", estimateId);

      return createdBov;
    } catch (error) {
      console.error("Error converting estimate to Blueprint of Values:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  // Helper to generate a unique BOV number
  async generateBovNumber(): Promise<string> {
    const prefix = "BOV";
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    // Get the latest BOV number with this prefix
    const { data, error } = await supabase
      .from("blueprint_of_values")
      .select("bov_number")
      .ilike("bov_number", `${prefix}${year}${month}%`)
      .order("bov_number", { ascending: false })
      .limit(1);

    if (error) throw error;

    let sequence = 1;
    if (data && data.length > 0 && data[0].bov_number) {
      // Extract the sequence number from the latest BOV number
      const latestSequence = Number.parseInt(data[0].bov_number.slice(-4), 10);
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1;
      }
    }

    return `${prefix}${year}${month}${sequence.toString().padStart(4, "0")}`;
  },
};
