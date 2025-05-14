import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"
import { formatDate as formatDateUtil } from "./utils"

// Define interface for the data returned by the getOpportunities query
interface OpportunityQueryResult {
  id: string;
  person_id: string;
  opportunity_name: string;
  description: string | null;
  status: string; // Assuming status is a string in the query result
  estimated_value: number | null;
  requested_completion_date: string | null; // Assuming date is returned as string
  assigned_user_id: string | null;
  created_by_user_id: string | null;
  created_at: string; // Assuming timestamp is returned as string
  updated_at: string; // Assuming timestamp is returned as string
  person: { // Nested person object structure
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone: string | null;
    person_type: string; // Assuming person_type is a string
  }; // Not nullable because person_id is not nullable in opportunities table
}

export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"]
export type NewOpportunity = Database["public"]["Tables"]["opportunities"]["Insert"]
export type UpdateOpportunity = Database["public"]["Tables"]["opportunities"]["Update"] & {
  requested_completion_date?: Date | string | null; // Allow Date object input
};

// Redefine OpportunityWithPerson to match the query result structure more directly
export interface OpportunityWithPerson {
  id: string;
  person_id: string; // Still include the foreign key ID
  opportunity_name: string;
  description: string | null;
  status: string; // Assuming status is a string in the query result
  estimated_value: number | null;
  requested_completion_date: string | null; // Assuming date is returned as string
  assigned_user_id: string | null;
  created_by_user_id: string | null;
  created_at: string; // Assuming timestamp is returned as string
  updated_at: string; // Assuming timestamp is returned as string
  person: { // Nested person object structure
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone: string | null;
    person_type: string; // Assuming person_type is a string
  }; // Not nullable because person_id is not nullable in opportunities table
}

// Keep the original OpportunityWithPerson definition for clarity if needed elsewhere,
// but the one above will be used for the getOpportunities return type.
// export type OriginalOpportunityWithPerson = Opportunity & {
//   person: {
//     id: string
//     name: string
//     email?: string | null
//     phone?: string | null
//     type: string
//   }
// }

// Update the OpportunityWithRelations type to include estimates
export type OpportunityWithRelations = OpportunityWithPerson & {
  appointments?: AppointmentSummary[]
  projects?: ProjectSummary[]
  estimates?: EstimateSummary[]
}

// Add the EstimateSummary type
export type EstimateSummary = {
  id: string
  estimate_number: string | null
  status: string
  issue_date: string | null
  expiration_date: string | null
  total_amount: number
}

export type AppointmentSummary = {
  id: string
  title: string
  status: string
  start_time: string
  end_time: string
  formatted_date: string
  formatted_time: string
}

export type ProjectSummary = {
  id: string
  project_number: string | null
  project_name: string
  status: string
  budget_amount: number | null
}

export type OpportunityFilters = {
  status?: string
  personId?: string
  search?: string
  minValue?: number
  maxValue?: number
}

// Helper function to validate UUID format
function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

export const opportunityService = {
  async getOpportunities(filters?: OpportunityFilters): Promise<OpportunityWithPerson[]> {
    try {
      const { data: opportunities, error } = await supabase
        .from("opportunities")
        .select(`
          id,
          opportunity_name, 
          description,
          status,
          estimated_value,
          requested_completion_date,
          person:person_id (id, first_name, last_name, business_name, email, phone, person_type)
        `)
        .order("updated_at", { ascending: false })

      if (error) throw error

      // Apply filters
      let query = supabase
        .from("opportunities")
        .select(`
          id,
          person_id,
          opportunity_name,
          description,
          status,
          estimated_value,
          requested_completion_date,
          assigned_user_id,
          created_by_user_id,
          created_at,
          updated_at,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone,
            person_type
          )
        `)
        .order("updated_at", { ascending: false })

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status)
      }

      if (filters?.personId) {
        query = query.eq("person_id", filters.personId)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.ilike("opportunity_name", searchTerm) // Corrected from title
      }

      if (filters?.minValue !== undefined) {
        query = query.gte("estimated_value", filters.minValue)
      }

      if (filters?.maxValue !== undefined) {
        query = query.lte("estimated_value", filters.maxValue)
      }

      const { data, error: queryError } = await query

      if (queryError) throw queryError

      // Cast data to the expected query result type
      const typedData = data as unknown as OpportunityQueryResult[];

      // Transform the data to match OpportunityWithPerson type
      return typedData.map((opportunity) => {
        // Workaround for potential incorrect type inference of nested person as array
        const personData = Array.isArray(opportunity.person) ? opportunity.person[0] : opportunity.person;

        return {
          ...opportunity,
          person: personData || {
            id: "",
            first_name: null,
            last_name: null,
            business_name: null,
            email: null,
            phone: null,
            person_type: "unknown"
          }
        };
      })
    } catch (error) {
      console.error("Error fetching opportunities:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  // Update the getOpportunityById method to fetch estimates
  async getOpportunityById(id: string): Promise<OpportunityWithRelations | null> {
    try {
      // Validate UUID format before querying the database
      if (!isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

      const { data, error } = await supabase
        .from("opportunities")
        .select(`
        *,
        person:person_id (
          id,
          first_name,
          last_name,
          business_name,
          email,
          phone,
          person_type
        )
      `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match OpportunityWithPerson type
      const opportunity = {
        ...data,
        person: data.person
          ? {
              id: data.person.id,
              name:
                data.person.business_name || `${data.person.first_name || ""} ${data.person.last_name || ""}`.trim(),
              email: data.person.email,
              phone: data.person.phone,
              type: data.person.person_type,
            }
          : {
              id: "",
              name: "Unknown",
              type: "",
            },
      }

      // Fetch related appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("*")
        .eq("opportunity_id", id)
        .order("start_time", { ascending: true })

      if (appointmentsError) throw appointmentsError

      // Fetch related projects
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, project_number, project_name, status, budget_amount")
        .eq("opportunity_id", id)
        .order("created_at", { ascending: false })

      if (projectsError) throw projectsError

      // Fetch related estimates
      const { data: estimatesData, error: estimatesError } = await supabase
        .from("estimates")
        .select("id, estimate_number, status, issue_date, expiration_date, total_amount")
        .eq("opportunity_id", id)
        .order("created_at", { ascending: false })

      if (estimatesError) throw estimatesError

      // Format appointments for display
      const appointments = appointmentsData.map((appointment) => {
        const startDate = new Date(appointment.start_time)
        const endDate = new Date(appointment.end_time)

        return {
          id: appointment.id,
          title: appointment.title,
          status: appointment.status,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          formatted_date: formatDateUtil(startDate.toISOString()),
          formatted_time: `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        }
      })

      return {
        ...opportunity,
        appointments,
        projects: projectsData,
        estimates: estimatesData,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createOpportunity(opportunity: NewOpportunity): Promise<Opportunity> {
    try {
      const { data, error } = await supabase.from("opportunities").insert(opportunity).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateOpportunity(id: string, updates: UpdateOpportunity): Promise<Opportunity> {
    try {
      const updatesForSupabase: Database["public"]["Tables"]["opportunities"]["Update"] = {}; // Start with the target type

      for (const key in updates) {
        if (updates.hasOwnProperty(key)) { // Ensure it's a direct property
          if (key === 'requested_completion_date') {
            const dateValue = updates[key];
            if (dateValue && typeof dateValue !== 'string') {
              // Convert Date object to string
              (updatesForSupabase as any)[key] = new Date(dateValue).toISOString().split('T')[0];
            } else if (dateValue === null) {
              (updatesForSupabase as any)[key] = null;
            } else if (typeof dateValue === 'string') {
              (updatesForSupabase as any)[key] = dateValue;
            }
            // If dateValue is undefined, we don't assign it, which is correct for Partial
          } else {
            // Copy other properties directly
            (updatesForSupabase as any)[key] = (updates as any)[key];
          }
        }
      }

      // Ensure updated_at is set explicitly
      updatesForSupabase.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("opportunities")
        .update(updatesForSupabase as any) // Forceful cast to any here
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteOpportunity(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("opportunities").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Calculate the weighted value of an opportunity (value * probability)
  calculateWeightedValue(opportunity: Opportunity): number {
    // Since we don't have probability in the schema, we'll just return the estimated value
    return opportunity.estimated_value || 0
  },
}

