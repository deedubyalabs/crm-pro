import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"

export type Task = Database["public"]["Tables"]["tasks"]["Row"]
export type NewTask = Database["public"]["Tables"]["tasks"]["Insert"]
export type UpdateTask = Database["public"]["Tables"]["tasks"]["Update"]

export type TaskWithRelations = Task & {
  person?: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  } | null
  opportunity?: {
    id: string
    title: string
  } | null
  project?: {
    id: string
    name: string
  } | null
}

export type TaskFilters = {
  status?: string
  personId?: string
  opportunityId?: string
  projectId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export const taskService = {
  async getTasks(filters?: TaskFilters): Promise<TaskWithRelations[]> {
    try {
      // First, check if the projects table exists and has the expected columns
      const { data: projectsInfo, error: projectsSchemaError } = await supabase
        .from("projects")
        .select("id, project_name")
        .limit(1)
        .maybeSingle()

      // Determine if we should include projects in the query
      const includeProjects = !projectsSchemaError

      // Build the base query
      let query = supabase
        .from("tasks")
        .select(`
          *,
          linked_person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          linked_opportunity_id (
            id,
            opportunity_name
          )
          ${
            includeProjects
              ? `,
          linked_project_id (
            id,
            project_name
          )`
              : ""
          }
        `)
        .order("start_time", { ascending: true })

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        // Convert status to title case to match the enum values in the database
        const statusMap: Record<string, string> = {
          "not started": "Not Started",
          "in progress": "In Progress",
          completed: "Completed",
          "on hold": "On Hold",
          cancelled: "Cancelled",
          scheduled: "Scheduled",
          rescheduled: "Rescheduled",
          "no show": "No Show",
        }

        const dbStatus = statusMap[filters.status.toLowerCase()] || filters.status
        query = query.eq("status", dbStatus)
      }

      if (filters?.personId) {
        query = query.eq("linked_person_id", filters.personId)
      }

      if (filters?.opportunityId) {
        query = query.eq("linked_opportunity_id", filters.opportunityId)
      }

      if (filters?.projectId && includeProjects) {
        query = query.eq("linked_project_id", filters.projectId)
      }

      if (filters?.startDate) {
        query = query.gte("start_time", filters.startDate)
      }

      if (filters?.endDate) {
        // Add one day to include the end date fully
        const endDateObj = new Date(filters.endDate)
        endDateObj.setDate(endDateObj.getDate() + 1)
        const nextDay = endDateObj.toISOString().split("T")[0]
        query = query.lt("start_time", nextDay)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        // Use ilike for case-insensitive search
        query = query.or(`subject.ilike.${searchTerm},description.ilike.${searchTerm},location.ilike.${searchTerm}`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match TaskWithRelations type
      return (data as unknown as (Database["public"]["Tables"]["tasks"]["Row"] & {
        linked_person_id: { id: string; first_name: string | null; last_name: string | null; business_name: string | null; email: string | null; phone: string | null; };
        linked_opportunity_id: { id: string; opportunity_name: string; };
        linked_project_id: { id: string; project_name: string; };
      })[]).map((task) => ({
        ...task,
        person: task.linked_person_id
          ? {
              id: task.linked_person_id.id,
              name:
                task.linked_person_id.business_name ||
                `${task.linked_person_id.first_name || ""} ${task.linked_person_id.last_name || ""}`.trim(),
              email: task.linked_person_id.email,
              phone: task.linked_person_id.phone,
            }
          : null,
        opportunity: task.linked_opportunity_id
          ? {
              id: task.linked_opportunity_id.id,
              title: task.linked_opportunity_id.opportunity_name,
            }
          : null,
        project: task.linked_project_id
          ? {
              id: task.linked_project_id.id,
              name: task.linked_project_id.project_name,
            }
          : null,
      }))
    } catch (error) {
      console.error("Error in getTasks:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getTaskById(id: string): Promise<TaskWithRelations | null> {
    try {
      // First, check if the projects table exists and has the expected columns
      const { data: projectsInfo, error: projectsSchemaError } = await supabase
        .from("projects")
        .select("id, project_name")
        .limit(1)
        .maybeSingle()

      // Determine if we should include projects in the query
      const includeProjects = !projectsSchemaError

      const { data, error } = await supabase
        .from("tasks")
        .select(`
          *,
          linked_person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          linked_opportunity_id (
            id,
            opportunity_name
          )
          ${
            includeProjects
              ? `,
          linked_project_id (
            id,
            project_name
          )`
              : ""
          }
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match TaskWithRelations type
      const taskData = data as unknown as (Database["public"]["Tables"]["tasks"]["Row"] & {
        linked_person_id: { id: string; first_name: string | null; last_name: string | null; business_name: string | null; email: string | null; phone: string | null; };
        linked_opportunity_id: { id: string; opportunity_name: string; };
        linked_project_id: { id: string; project_name: string; };
      });
      return {
        ...taskData,
        person: taskData.linked_person_id
          ? {
              id: taskData.linked_person_id.id,
              name:
                taskData.linked_person_id.business_name || `${taskData.linked_person_id.first_name || ""} ${taskData.linked_person_id.last_name || ""}`.trim(),
              email: taskData.linked_person_id.email,
              phone: taskData.linked_person_id.phone,
            }
          : null,
        opportunity: taskData.linked_opportunity_id
          ? {
              id: taskData.linked_opportunity_id.id,
              title: taskData.linked_opportunity_id.opportunity_name,
            }
          : null,
        project: taskData.linked_project_id
          ? {
              id: taskData.linked_project_id.id,
              name: taskData.linked_project_id.project_name,
            }
          : null,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // The rest of the service methods remain the same
  async createTask(task: NewTask): Promise<Task> {
    try {
      const { data, error } = await supabase.from("tasks").insert(task).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateTask(id: string, updates: UpdateTask): Promise<Task> {
    try {
      const { data, error } = await supabase
        .from("tasks")
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

  async deleteTask(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Get tasks for a specific date range (e.g., for calendar view)
  async getTasksByDateRange(startDate: string, endDate: string): Promise<TaskWithRelations[]> {
    return this.getTasks({ startDate, endDate })
  },
}
