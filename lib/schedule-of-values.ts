import { supabase, handleSupabaseError } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { EstimateLineItem } from "@/types/estimates";
import { ScheduleOfValue, ScheduleOfValueItem, NewScheduleOfValue, NewScheduleOfValueItem } from "@/types/schedule-of-values";

export const scheduleOfValuesService = {
  async createScheduleOfValue(sov: NewScheduleOfValue, items: NewScheduleOfValueItem[] = []): Promise<ScheduleOfValue> {
    try {
      const sovId = uuidv4(); // Removed sov.id as it's omitted in NewScheduleOfValue
      const now = new Date().toISOString();

      // Calculate total amount from items
      const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

      const { data, error } = await supabase.from("schedule_of_values").insert({
        ...sov,
        id: sovId,
        total_amount: totalAmount,
        created_at: now,
        updated_at: now,
      }).select().single();

      if (error) throw error;

      const createdSov = data as ScheduleOfValue;

      if (items.length > 0) {
        const sovItems = items.map((item, index) => ({
          id: uuidv4(), // Removed item.id as it's omitted in NewScheduleOfValueItem
          sov_id: createdSov.id,
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

        const { error: itemsError } = await supabase.from("schedule_of_value_items").insert(sovItems);
        if (itemsError) throw itemsError;
      }

      return createdSov;
    } catch (error) {
      console.error("Error creating Schedule of Value:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getScheduleOfValueById(id: string): Promise<ScheduleOfValue | null> {
    try {
      const { data, error } = await supabase
        .from("schedule_of_values")
        .select(`*, items:schedule_of_value_items(*)`)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ScheduleOfValue;
    } catch (error) {
      console.error("Error fetching Schedule of Value:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async convertEstimateToScheduleOfValue(estimateId: string, userId: string | null): Promise<ScheduleOfValue> {
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

      const newSov: NewScheduleOfValue = {
        project_id: estimate.project_id,
        estimate_id: estimate.id,
        name: `SOV for Estimate ${estimate.estimate_number}`,
        status: "Draft",
      };

      // Explicitly cast estimate.line_items to EstimateLineItem[]
      const typedEstimateLineItems = estimate.line_items as unknown as EstimateLineItem[];

      const sovItems: NewScheduleOfValueItem[] = typedEstimateLineItems.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_cost, // Assuming unit_cost from estimate becomes unit_price for SOV
        is_billed: false,
        invoice_line_item_id: null,
        linked_estimate_line_item_id: item.id,
        linked_change_order_line_item_id: null,
        sort_order: item.sort_order,
        sov_id: "", // Will be filled by createScheduleOfValue
      }));

      const createdSov = await this.createScheduleOfValue(newSov, sovItems);

      // Update the estimate to mark it as converted to SOV
      await supabase.from("estimates").update({
        is_converted_to_sov: true,
        updated_at: new Date().toISOString(),
      }).eq("id", estimateId);

      return createdSov;
    } catch (error) {
      console.error("Error converting estimate to Schedule of Value:", error);
      throw new Error(handleSupabaseError(error));
    }
  },
};
