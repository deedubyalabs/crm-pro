import { supabase, handleSupabaseError } from "./supabase"
import type { Project, NewProject, UpdateProject, ProjectWithCustomer, ProjectFilters } from "../types/project";
import type { Database } from "../types/supabase"; // Import Database to access enums

export type ProjectStatus = Database["public"]["Enums"]["project_status"];

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
      if (filters?.status && filters.status !== "") {
        query = query.eq("status", filters.status as NonNullable<Project["status"]>)
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
        if (filters?.status && filters.status !== "") {
          query = query.eq("status", filters.status as NonNullable<Project["status"]>)
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

      // After project creation, check if the associated person is a Lead and convert to Customer
      if (data.person_id) {
        const { personService, PersonType } = await import("./people") // Dynamically import to avoid circular dependency
        const person = await personService.getPersonById(data.person_id)

        if (person && person.person_type === PersonType.LEAD) {
          console.log(`Converting lead ${person.id} to customer upon project creation.`)
          await personService.updatePerson(person.id, { person_type: PersonType.CUSTOMER })
        }
      }

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

  async updateJobStatus(jobId: string, status: "Scheduled" | "Completed" | "Canceled" | "Pending" | "In Progress" | "Blocked"): Promise<Job> {
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

  async updateProjectInvoicedAmount(projectId: string, amount: number): Promise<Project> {
    try {
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("total_invoiced_amount")
        .eq("id", projectId)
        .single();

      if (fetchError) throw fetchError;
      if (!project) throw new Error("Project not found");

      const newTotalInvoicedAmount = (project.total_invoiced_amount || 0) + amount;

      const { data, error } = await supabase
        .from("projects")
        .update({ total_invoiced_amount: newTotalInvoicedAmount, updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project invoiced amount:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProjectOutstandingBalance(projectId: string, amount: number): Promise<Project> {
    // try {
    //   // outstanding_balance is a calculated field, not a direct column.
    //   // This function needs to be re-evaluated. For now, commenting out to fix build.
    //   // It should likely update total_invoiced_amount or total_payments_received
    //   // which would then be used to calculate outstanding_balance elsewhere.
    //   console.warn("updateProjectOutstandingBalance is called but outstanding_balance is not a direct DB column and needs recalculation logic.");
    //   const project = await this.getProjectById(projectId);
    //   if (!project) throw new Error("Project not found for outstanding balance update.");
    //   // No direct update, just return the project or throw error if it's meant to do something.
    //   return project as Project; // Cast needed as getProjectById returns ProjectWithCustomer
    // } catch (error) {
    //   console.error("Error in stubbed updateProjectOutstandingBalance:", error);
    //   throw new Error(handleSupabaseError(error));
    // }
    // For now, let's fetch the project and return it, assuming the caller might rely on the return type.
    // Or, if this function is critical, it needs to be properly implemented.
    // To avoid breaking changes severely, we'll fetch and return the project.
    const projectData = await this.getProjectById(projectId);
    if (!projectData) {
      throw new Error(`Project with ID ${projectId} not found when trying to update outstanding balance.`);
    }
    // This function should not directly update an 'outstanding_balance' column if it doesn't exist.
    // It's a calculated value. We'll return the project as is.
    // The actual calculation of outstanding_balance should happen where it's displayed or used.
    console.warn("updateProjectOutstandingBalance was called, but 'outstanding_balance' is a calculated field and not directly updatable. Returning current project state.");
    return projectData as Project; // Cast because getProjectById returns ProjectWithCustomer
  },

  async updateProjectTotalPaymentsReceived(projectId: string, amount: number): Promise<Project> {
    try {
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("total_payments_received")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error("Fetch error in updateProjectTotalPaymentsReceived:", fetchError);
        throw fetchError;
      }
      if (!project) throw new Error("Project not found in updateProjectTotalPaymentsReceived");

      const newTotalPaymentsReceived = (project.total_payments_received || 0) + amount;

      const { data, error } = await supabase
        .from("projects")
        .update({ total_payments_received: newTotalPaymentsReceived, updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project total payments received:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProjectActualCost(projectId: string, amount: number): Promise<Project> {
    try {
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("actual_cost")
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error("Fetch error in updateProjectActualCost:", fetchError);
        throw fetchError;
      }
      if (!project) throw new Error("Project not found in updateProjectActualCost");

      const newActualCost = (project.actual_cost || 0) + amount;

      const { data, error } = await supabase
        .from("projects")
        .update({ actual_cost: newActualCost, updated_at: new Date().toISOString() })
        .eq("id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project actual cost:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateProjectRevisedBudget(projectId: string, amount: number): Promise<Project> {
    try {
      const { data: project, error: fetchError } = await supabase
        .from("projects")
        .select("budget_amount") // Changed from revised_budget
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error("Fetch error in updateProjectRevisedBudget:", fetchError);
        throw fetchError;
      }
      if (!project) throw new Error("Project not found in updateProjectRevisedBudget");

      // Assuming 'amount' is the new budget or an adjustment to the existing budget.
      // If 'amount' is the total new budget:
      // const newBudgetValue = amount;
      // If 'amount' is an adjustment:
      const newBudgetValue = (project.budget_amount || 0) + amount;


      const { data, error } = await supabase
        .from("projects")
        .update({ budget_amount: newBudgetValue, updated_at: new Date().toISOString() }) // Changed from revised_budget
        .eq("id", projectId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error updating project budget_amount (formerly revised_budget):", error);
      throw new Error(handleSupabaseError(error));
    }
  },
}
