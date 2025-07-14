import { supabase, handleSupabaseError } from "./supabase";
import type {
  EstimatePaymentSchedule,
  NewEstimatePaymentSchedule,
  UpdateEstimatePaymentSchedule,
} from "@/types/estimates";

export const estimatePaymentScheduleService = {
  async getPaymentSchedules(estimateId: string): Promise<EstimatePaymentSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order");

      if (error) throw error;
      return (data || []) as unknown as EstimatePaymentSchedule[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
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
        .limit(1);

      if (countError) throw countError;

      const sortOrder = existingSchedules && existingSchedules.length > 0 ? existingSchedules[0].sort_order + 1 : 0;

      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .insert({ ...schedule, sort_order: sortOrder } as any) // Cast to any
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      return data as unknown as EstimatePaymentSchedule;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updatePaymentSchedule(id: string, updates: UpdateEstimatePaymentSchedule): Promise<EstimatePaymentSchedule> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() } as any) // Cast to any
        .eq("id", id)
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      return data as unknown as EstimatePaymentSchedule;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deletePaymentSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("estimate_payment_schedules").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },
};
