import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"
import { formatDate as formatDateUtil } from "./utils"

// Define interface for the data returned by the getOpportunities query
interface OpportunityQueryResult {
  id: string;
  person_id: string;
  opportunity_name: string;
  description: string | null;
  status: OpportunityStatus; // Use OpportunityStatus enum for type safety
  estimated_value: number | null;
  probability: number | null; // Added probability
  requested_completion_date: string | null; // Assuming date is returned as string
  expected_close_date: string | null; // Added expected_close_date
  source: string | null; // Added source
  assigned_user_id: string | null; // Reverted to assigned_user_id
  created_by_user_id: string | null;
  created_at: string; // Assuming timestamp is returned as string
  updated_at: string; // Assuming timestamp is returned as string
  lead_score: number | null; // Added lead_score
  person: { // Nested person object structure
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone: string | null;
    person_type: string; // Assuming person_type is a string
    name: string; // Added name
    type: string; // Added type (mapping from person_type)
  }; // Not nullable because person_id is not nullable in opportunities table
}

export type Opportunity = Database["public"]["Tables"]["opportunities"]["Row"]
export type NewOpportunity = Database["public"]["Tables"]["opportunities"]["Insert"]
export type UpdateOpportunity = Database["public"]["Tables"]["opportunities"]["Update"] & {
  requested_completion_date?: Date | string | null; // Allow Date object input
  expected_close_date?: Date | string | null; // Added expected_close_date
  lead_score?: number | null; // Added lead_score
};

// Redefine OpportunityWithPerson to match the query result structure more directly
export interface OpportunityWithPerson {
  id: string;
  person_id: string; // Still include the foreign key ID
  opportunity_name: string;
  description: string | null;
  status: OpportunityStatus; // Use OpportunityStatus enum for type safety
  estimated_value: number | null;
  probability: number | null; // Added probability
  requested_completion_date: string | null; // Assuming date is returned as string
  expected_close_date: string | null; // Added expected_close_date
  source: string | null; // Added source
  assigned_user_id: string | null; // Reverted to assigned_user_id
  created_by_user_id: string | null;
  created_at: string; // Assuming timestamp is returned as string
  updated_at: string; // Assuming timestamp is returned as string
  lead_score: number | null; // Added lead_score
  person: { // Nested person object structure
    id: string;
    first_name: string | null;
    last_name: string | null;
    business_name: string | null;
    email: string | null;
    phone: string | null;
    person_type: string; // Assuming person_type is a string
    name: string; // Added name
    type: string; // Added type (mapping from person_type)
  }; // Not nullable because person_id is not nullable in opportunities table
}

// Update the OpportunityWithRelations type to include estimates
export type OpportunityWithRelations = OpportunityWithPerson & {
  appointments?: TaskSummary[]
  projects?: ProjectSummary[]
  estimates?: EstimateSummary[]
}

// Add the EstimateSummary type
export type EstimateSummary = {
  created_at: string | number | Date;
  estimate_number: string | null; // Changed from title to estimate_number
  id: string
  status: string
  issue_date: string | null
  expiration_date: string | null
  total_amount: number
}

export type TaskSummary = {
  id: string
  title: string // This will be mapped from appointment_type or a combination of fields
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

export type OpportunityStatus = "New Lead" | "Contact Attempted" | "Contacted" | "Needs Scheduling" | "Task Scheduled" | "Needs Estimate" | "Estimate Sent" | "Estimate Accepted" | "Estimate Rejected" | "On Hold" | "Lost"

export type OpportunityFilters = {
  status?: OpportunityStatus | "all"
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
          probability,
          requested_completion_date,
          source,
          assigned_user_id,
          created_by_user_id,
          created_at,
          updated_at,
          lead_score,
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

      // Transform the data to match OpportunityWithPerson type, mapping assigned_user_id and requested_completion_date
      return typedData.map((opportunity) => {
        // Workaround for potential incorrect type inference of nested person as array
        const personData = Array.isArray(opportunity.person) ? opportunity.person[0] : opportunity.person;

        return {
          ...opportunity,
          assigned_to: opportunity.assigned_user_id, // Map assigned_user_id to assigned_to
          expected_close_date: opportunity.requested_completion_date, // Map requested_completion_date to expected_close_date
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
  async getOpportunityById(id: string, supabaseClient = supabase): Promise<OpportunityWithRelations | null> {
    try {
      // Validate UUID format before querying the database
      if (!isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

      const { data, error } = await supabaseClient
        .from("opportunities")
        .select(`
        *,
        lead_score,
        person:person_id (
          id,
          first_name,
          last_name,
          business_name,
          email,
          phone,
          person_type
        ),
        estimates:estimates (
          id,
          estimate_number,
          status,
          issue_date,
          expiration_date,
          total_amount,
          created_at
        )
      `)
        .eq("id", id)
        .single()

      if (error) throw error

      if (!data) return null

      // Transform the data to match OpportunityWithRelations type
      const opportunity: OpportunityWithRelations = {
        ...data,
        expected_close_date: data.requested_completion_date, // Map requested_completion_date to expected_close_date
        person: data.person
          ? {
              id: data.person.id,
              first_name: data.person.first_name,
              last_name: data.person.last_name,
              business_name: data.person.business_name,
              email: data.person.email,
              phone: data.person.phone,
              person_type: data.person.person_type,
              name:
                data.person.business_name || `${data.person.first_name || ""} ${data.person.last_name || ""}`.trim(),
              type: data.person.person_type,
            }
          : {
              id: "",
              first_name: null,
              last_name: null,
              business_name: null,
              email: null,
              phone: null,
              person_type: "unknown",
              name: "Unknown",
              type: "unknown",
            },
        estimates: data.estimates || [], // Include fetched estimates
      }

      // Fetch related appointments (if not already fetched by the main query)
      // Note: The main query above now fetches estimates directly.
      // If appointments/projects are also needed, they should be added to the main select or fetched separately.
      // For now, assuming appointments/projects are fetched elsewhere or not strictly needed in this specific service call context.

      // If appointments are needed, fetch them here:
      const { data: appointmentsData, error: appointmentsError } = await supabaseClient
        .from("appointments")
        .select("*")
        .eq("opportunity_id", id)
        .order("start_time", { ascending: true });

      if (appointmentsError) {
        console.error("Error fetching related appointments:", appointmentsError);
        opportunity.appointments = []; // Set to empty array on error
      } else {
         // Format appointments for display
        opportunity.appointments = appointmentsData.map((task) => {
          const startDate = new Date(task.start_time);
          const endDate = new Date(task.end_time);

          return {
            id: task.id,
            title: task.appointment_type, // Use appointment_type as the title
            status: task.status,
            start_time: task.start_time,
            end_time: task.end_time,
            formatted_date: formatDateUtil(startDate.toISOString()),
            formatted_time: `${startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          };
        });
      }

       // Fetch related projects (if not already fetched by the main query)
       const { data: projectsData, error: projectsError } = await supabaseClient
        .from("projects")
        .select("id, project_number, project_name, status, budget_amount")
        .eq("opportunity_id", id)
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error("Error fetching related projects:", projectsError);
        opportunity.projects = []; // Set to empty array on error
      } else {
        opportunity.projects = projectsData;
      }


      return opportunity;

    } catch (error) {
      console.error("Error fetching opportunity by ID:", error);
      throw new Error(handleSupabaseError(error));
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
    // Use lead_score if available, otherwise fallback to estimated_value
    return opportunity.lead_score !== null && opportunity.lead_score !== undefined
      ? opportunity.lead_score
      : opportunity.estimated_value || 0;
  },
}
