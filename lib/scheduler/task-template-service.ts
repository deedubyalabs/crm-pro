import { supabase, handleSupabaseError } from "../supabase"
import type {
  TaskTemplate,
  NewTaskTemplate,
  UpdateTaskTemplate,
} from "@/types/scheduler"

export const taskTemplateService = {
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    try {
      const { data, error } = await supabase.from("task_templates").select("*").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getTaskTemplateById(id: string): Promise<TaskTemplate | null> {
    try {
      const { data, error } = await supabase.from("task_templates").select("*").eq("id", id).single()

      if (error) throw error
      return data
    }
    catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createTaskTemplate(template: NewTaskTemplate): Promise<TaskTemplate> {
    try {
      const { data, error } = await supabase.from("task_templates").insert(template).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateTaskTemplate(id: string, updates: UpdateTaskTemplate): Promise<TaskTemplate> {
    try {
      const { data, error } = await supabase
        .from("task_templates")
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

  async deleteTaskTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("task_templates").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
