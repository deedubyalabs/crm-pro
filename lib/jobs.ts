import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"

export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"]
export type UpdateJob = Database["public"]["Tables"]["jobs"]["Update"]

export type JobWithRelations = Job & {
  project: {
    id: string
    project_name: string
  } | null
  assigned_to: {
    id: string
    name: string
  } | null
}

export type JobFilters = {
  status?: string
  projectId?: string
  assignedToId?: string
  search?: string
  startDate?: string
  endDate?: string
}

export const JOB_STATUSES = ["Pending", "Scheduled", "In Progress", "Blocked", "Completed", "Canceled"] as const

export type JobStatus = (typeof JOB_STATUSES)[number]

export const jobService = {
  async getJobs(filters?: JobFilters): Promise<JobWithRelations[]> {
    try {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          assigned_to:assigned_to_user_id (
            id,
            first_name,
            last_name
          )
        `)
        .order("updated_at", { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId)
      }

      if (filters?.assignedToId) {
        query = query.eq("assigned_to_user_id", filters.assignedToId)
      }

      if (filters?.search) {
        query = query.ilike("name", `%${filters.search}%`) // Changed from job_name to name
      }

      if (filters?.startDate) {
        query = query.gte("scheduled_start_date", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("scheduled_end_date", filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match JobWithRelations type
      return data.map((job) => ({
        ...job,
        project: job.project
          ? {
              id: job.project.id,
              project_name: job.project.project_name,
            }
          : null,
        assigned_to: job.assigned_to
          ? {
              id: job.assigned_to.id,
              name: `${job.assigned_to.first_name || ""} ${job.assigned_to.last_name || ""}`.trim(),
            }
          : null,
      }))
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getJobById(id: string): Promise<JobWithRelations | null> {
    try {
      // Basic UUID validation to prevent invalid queries
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.error(`Invalid UUID format: ${id}`)
        return null
      }

      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          assigned_to:assigned_to_user_id (
            id,
            first_name,
            last_name
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match JobWithRelations type
      return {
        ...data,
        project: data.project
          ? {
              id: data.project.id,
              project_name: data.project.project_name,
            }
          : null,
        assigned_to: data.assigned_to
          ? {
              id: data.assigned_to.id,
              name: `${data.assigned_to.first_name || ""} ${data.assigned_to.last_name || ""}`.trim(),
            }
          : null,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createJob(job: NewJob): Promise<Job> {
    try {
      // Get the current highest sort order for this project
      const { data: existingJobs, error: sortError } = await supabase
        .from("jobs")
        .select("sort_order")
        .eq("project_id", job.project_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (sortError) throw sortError

      // Set the sort order to be one higher than the current highest
      const sortOrder = existingJobs.length > 0 ? (existingJobs[0].sort_order || 0) + 1 : 0

      // Create the job with the calculated sort order
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...job,
          sort_order: sortOrder,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateJob(id: string, updates: UpdateJob): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from("jobs")
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

  async deleteJob(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateJobStatus(id: string, status: JobStatus): Promise<Job> {
    try {
      const updates: UpdateJob = {
        status,
        updated_at: new Date().toISOString(),
      }

      // If status is "Completed", set the actual_end_date
      if (status === "Completed") {
        updates.actual_end_date = new Date().toISOString()
      }

      // If status is "In Progress" and there's no actual_start_date, set it
      if (status === "In Progress") {
        const { data: job } = await supabase.from("jobs").select("actual_start_date").eq("id", id).single()
        if (job && !job.actual_start_date) {
          updates.actual_start_date = new Date().toISOString()
        }
      }

      const { data, error } = await supabase.from("jobs").update(updates).eq("id", id).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async logTime(id: string, hours: number, notes?: string): Promise<Job> {
    try {
      // Get current actual_hours
      const { data: job, error: fetchError } = await supabase.from("jobs").select("actual_hours").eq("id", id).single()

      if (fetchError) throw fetchError

      const currentHours = job.actual_hours || 0
      const newHours = currentHours + hours

      // Create a time log entry (assuming you have a time_logs table)
      try {
        await supabase.from("time_logs").insert({
          job_id: id,
          hours,
          notes,
          logged_at: new Date().toISOString(),
        })
      } catch (logError) {
        console.error("Failed to create time log entry:", logError)
        // Continue with updating the job even if logging fails
      }

      // Update the job with the new hours
      const { data, error } = await supabase
        .from("jobs")
        .update({
          actual_hours: newHours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async assignJob(id: string, userId: string): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update({
          assigned_to_user_id: userId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async reorderJobs(projectId: string, jobIds: string[]): Promise<void> {
    try {
      // Update each job with its new sort order
      for (let i = 0; i < jobIds.length; i++) {
        const { error } = await supabase
          .from("jobs")
          .update({
            sort_order: i,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobIds[i])
          .eq("project_id", projectId)

        if (error) throw error
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  calculateProgress(job: Job): number {
    if (job.status === "Completed") return 100
    if (job.status === "Canceled") return 0

    // If we have actual and estimated hours, calculate based on that
    if (job.actual_hours !== null && job.estimated_hours !== null && job.estimated_hours > 0) {
      const progress = Math.min(100, Math.round((job.actual_hours / job.estimated_hours) * 100))
      return progress
    }

    // Otherwise, use status-based progress
    switch (job.status) {
      case "Pending":
        return 0
      case "Scheduled":
        return 10
      case "In Progress":
        return 50
      case "Blocked":
        return 30
      default:
        return 0
    }
  },

  getTimeRemaining(job: Job): number | null {
    if (!job.estimated_hours) return null

    const actualHours = job.actual_hours || 0
    return Math.max(0, job.estimated_hours - actualHours)
  },

  isOverdue(job: Job): boolean {
    if (!job.scheduled_end_date) return false
    if (job.status === "Completed" || job.status === "Canceled") return false

    const endDate = new Date(job.scheduled_end_date)
    const today = new Date()

    return endDate < today
  },
}
