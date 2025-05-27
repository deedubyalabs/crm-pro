import { supabase, handleSupabaseError } from "../supabase"
import type {
  JobDependency,
  NewJobDependency,
  UpdateJobDependency,
} from "@/types/scheduler"

export const jobDependencyService = {
  async createJobDependency(dependency: NewJobDependency): Promise<JobDependency> {
    try {
      const { data, error } = await supabase.from("job_dependencies").insert(dependency).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateJobDependency(id: string, updates: UpdateJobDependency): Promise<JobDependency> {
    try {
      const { data, error } = await supabase
        .from("job_dependencies")
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

  async deleteJobDependency(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("job_dependencies").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
