import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type NewProject = Database["public"]["Tables"]["projects"]["Insert"]
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"]

export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"]
export type UpdateJob = Database["public"]["Tables"]["jobs"]["Update"]

export type ProjectWithCustomer = Project & {
  customer: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  } | null
}

export type ProjectFilters = {
  status?: string
  customerId?: string
  search?: string
}

export const projectService = {
  async getProjects(filters?: ProjectFilters): Promise<ProjectWithCustomer[]> {
    try {
      // First, try to get projects with customer join
      let query = supabase
        .from("projects")
        .select(`
          *,
          customer:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          )
        `)
        .order("updated_at", { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.customerId) {
        query = query.eq("person_id", filters.customerId)
      }

      if (filters?.search) {
        query = query.ilike("project_name", `%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match ProjectWithCustomer type
      return data.map((project) => ({
        ...project,
        customer: project.customer
          ? {
              id: project.customer.id,
              name:
                project.customer.business_name ||
                `${project.customer.first_name || ""} ${project.customer.last_name || ""}`.trim(),
              email: project.customer.email,
              phone: project.customer.phone,
            }
          : null,
      }))
    } catch (error) {
      console.error("Error with join query:", error)

      // Fallback: If the join fails, fetch projects without the join
      try {
        let query = supabase.from("projects").select("*").order("updated_at", { ascending: false })

        // Apply filters
        if (filters?.status) {
          query = query.eq("status", filters.status)
        }

        if (filters?.customerId) {
          query = query.eq("person_id", filters.customerId)
        }

        if (filters?.search) {
          query = query.ilike("project_name", `%${filters.search}%`)
        }

        const { data, error } = await query

        if (error) throw error

        // Return projects without customer data
        return data.map((project) => ({
          ...project,
          customer: null,
        }))
      } catch (fallbackError) {
        throw new Error(handleSupabaseError(fallbackError))
      }
    }
  },

  async getProjectById(id: string): Promise<ProjectWithCustomer | null> {
    try {
      // Basic UUID validation to prevent invalid queries
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(id)) {
        console.error(`Invalid UUID format: ${id}`)
        return null
      }

      // First try with the join
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            customer:person_id (
              id,
              first_name,
              last_name,
              business_name,
              email,
              phone
            )
          `)
          .eq("id", id)
          .single()

        if (error) throw error

        if (!data) return null

        // Transform the data to match ProjectWithCustomer type
        return {
          ...data,
          customer: data.customer
            ? {
                id: data.customer.id,
                name:
                  data.customer.business_name ||
                  `${data.customer.first_name || ""} ${data.customer.last_name || ""}`.trim(),
                email: data.customer.email,
                phone: data.customer.phone,
              }
            : null,
        }
      } catch (error) {
        console.error("Error with join query:", error)

        // Fallback: If the join fails, fetch project without the join
        const { data, error: projectError } = await supabase.from("projects").select("*").eq("id", id).single()

        if (projectError) throw projectError

        if (!data) return null

        // Return project without customer data
        return {
          ...data,
          customer: null,
        }
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createProject(project: NewProject): Promise<Project> {
    try {
      const { data, error } = await supabase.from("projects").insert(project).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateProject(id: string, updates: UpdateProject): Promise<Project> {
    try {
      const { data, error } = await supabase
        .from("projects")
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

  async deleteProject(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getProjectJobs(projectId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true })
        .order("scheduled_start_date", { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getJobById(jobId: string): Promise<Job | null> {
    try {
      // Basic UUID validation to prevent invalid queries
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (!uuidRegex.test(jobId)) {
        console.error(`Invalid UUID format: ${jobId}`)
        return null
      }

      const { data, error } = await supabase.from("jobs").select("*").eq("id", jobId).single()

      if (error) throw error
      return data
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

  async updateJob(jobId: string, updates: UpdateJob): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", jobId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteJob(jobId: string): Promise<void> {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", jobId)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateJobStatus(jobId: string, status: string): Promise<Job> {
    try {
      const now = new Date().toISOString()
      const updates: UpdateJob = {
        status,
        updated_at: now,
      }

      // Set actual start date if moving to "In Progress" for the first time
      if (status.toLowerCase() === "in progress") {
        const job = await this.getJobById(jobId)
        if (job && !job.actual_start_date) {
          updates.actual_start_date = now
        }
      }

      // Set actual end date if completing or canceling
      if (status.toLowerCase() === "completed" || status.toLowerCase() === "canceled") {
        updates.actual_end_date = now
      }

      const { data, error } = await supabase.from("jobs").update(updates).eq("id", jobId).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async logJobTime(jobId: string, hours: number, notes?: string): Promise<Job> {
    try {
      // Get current job to calculate new total hours
      const job = await this.getJobById(jobId)
      if (!job) {
        throw new Error("Job not found")
      }

      // Calculate new total hours
      const currentHours = job.actual_hours || 0
      const newTotalHours = currentHours + hours

      // Update job with new hours
      const { data, error } = await supabase
        .from("jobs")
        .update({
          actual_hours: newTotalHours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .select()
        .single()

      if (error) throw error

      // TODO: Create time log entry in a separate table when that feature is implemented

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
