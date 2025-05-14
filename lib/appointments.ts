import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"

export type Appointment = Database["public"]["Tables"]["appointments"]["Row"]
export type NewAppointment = Database["public"]["Tables"]["appointments"]["Insert"]
export type UpdateAppointment = Database["public"]["Tables"]["appointments"]["Update"]

export type AppointmentWithRelations = Appointment & {
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

export type AppointmentFilters = {
  status?: string
  personId?: string
  opportunityId?: string
  projectId?: string
  startDate?: string
  endDate?: string
  search?: string
}

export const appointmentService = {
  async getAppointments(filters?: AppointmentFilters): Promise<AppointmentWithRelations[]> {
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
        .from("appointments")
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          )
          ${
            includeProjects
              ? `,
          project:project_id (
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
          scheduled: "Scheduled",
          completed: "Completed",
          canceled: "Canceled",
          rescheduled: "Rescheduled",
          no_show: "No Show",
        }

        const dbStatus = statusMap[filters.status] || filters.status
        query = query.eq("status", dbStatus)
      }

      if (filters?.personId) {
        query = query.eq("person_id", filters.personId)
      }

      if (filters?.opportunityId) {
        query = query.eq("opportunity_id", filters.opportunityId)
      }

      if (filters?.projectId && includeProjects) {
        query = query.eq("project_id", filters.projectId)
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
        query = query.or(`appointment_type.ilike.${searchTerm},notes.ilike.${searchTerm},address.ilike.${searchTerm}`)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match AppointmentWithRelations type
      return data.map((appointment) => ({
        ...appointment,
        person: appointment.person
          ? {
              id: appointment.person.id,
              name:
                appointment.person.business_name ||
                `${appointment.person.first_name || ""} ${appointment.person.last_name || ""}`.trim(),
              email: appointment.person.email,
              phone: appointment.person.phone,
            }
          : null,
        opportunity: appointment.opportunity
          ? {
              id: appointment.opportunity.id,
              title: appointment.opportunity.opportunity_name,
            }
          : null,
        project: appointment.project
          ? {
              id: appointment.project.id,
              name: appointment.project.project_name,
            }
          : null,
      }))
    } catch (error) {
      console.error("Error in getAppointments:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async getAppointmentById(id: string): Promise<AppointmentWithRelations | null> {
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
        .from("appointments")
        .select(`
          *,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          )
          ${
            includeProjects
              ? `,
          project:project_id (
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

      // Transform the data to match AppointmentWithRelations type
      return {
        ...data,
        person: data.person
          ? {
              id: data.person.id,
              name:
                data.person.business_name || `${data.person.first_name || ""} ${data.person.last_name || ""}`.trim(),
              email: data.person.email,
              phone: data.person.phone,
            }
          : null,
        opportunity: data.opportunity
          ? {
              id: data.opportunity.id,
              title: data.opportunity.opportunity_name,
            }
          : null,
        project: data.project
          ? {
              id: data.project.id,
              name: data.project.project_name,
            }
          : null,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // The rest of the service methods remain the same
  async createAppointment(appointment: NewAppointment): Promise<Appointment> {
    try {
      const { data, error } = await supabase.from("appointments").insert(appointment).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateAppointment(id: string, updates: UpdateAppointment): Promise<Appointment> {
    try {
      const { data, error } = await supabase
        .from("appointments")
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

  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Get appointments for a specific date range (e.g., for calendar view)
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<AppointmentWithRelations[]> {
    return this.getAppointments({ startDate, endDate })
  },

  // Generate a Cal.com scheduling link
  generateCalLink(type: string, personId?: string): string {
    // This is a placeholder - in a real implementation, you would generate a proper Cal.com link
    // based on your Cal.com account and event types
    const baseUrl = "https://cal.com/your-organization"
    const eventType = encodeURIComponent(type)
    let url = `${baseUrl}/${eventType}`

    if (personId) {
      url += `?personId=${personId}`
    }

    return url
  },
}
