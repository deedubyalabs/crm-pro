import { supabase, handleSupabaseError } from "../supabase"
import type {
  SchedulingConstraint,
  NewSchedulingConstraint,
  UpdateSchedulingConstraint,
} from "@/types/scheduler"

export const schedulingConstraintService = {
  async createSchedulingConstraint(
    constraint: NewSchedulingConstraint,
  ): Promise<SchedulingConstraint> {
    try {
      const { data, error } = await supabase
        .from("scheduling_constraints")
        .insert(constraint)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateSchedulingConstraint(
    id: string,
    updates: UpdateSchedulingConstraint,
  ): Promise<SchedulingConstraint> {
    try {
      const { data, error } = await supabase
        .from("scheduling_constraints")
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

  async deleteSchedulingConstraint(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("scheduling_constraints")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
