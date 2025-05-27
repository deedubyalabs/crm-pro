import { supabase, handleSupabaseError } from "../supabase"
import type {
  SchedulingConflict,
  NewSchedulingConflict,
  UpdateSchedulingConflict,
} from "@/types/scheduler"

export const schedulingConflictService = {
  async createSchedulingConflict(
    conflict: NewSchedulingConflict,
  ): Promise<SchedulingConflict> {
    try {
      const { data, error } = await supabase
        .from("scheduling_conflicts")
        .insert(conflict)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateSchedulingConflict(
    id: string,
    updates: UpdateSchedulingConflict,
  ): Promise<SchedulingConflict> {
    try {
      const { data, error } = await supabase
        .from("scheduling_conflicts")
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

  async deleteSchedulingConflict(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("scheduling_conflicts")
        .delete()
        .eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getSchedulingConflicts(projectId: string): Promise<SchedulingConflict[]> {
    try {
      const { data, error } = await supabase
        .from("scheduling_conflicts")
        .select("*")
        .eq("project_id", projectId)

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
