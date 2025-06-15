import { supabase, handleSupabaseError } from "./supabase"
import type { Database } from "@/types/supabase"
import { Person, NewPerson, UpdatePerson, PersonType } from "@/types/people"; // Import types from types/people

export type { PersonType }; // Export PersonType

export type PersonFilters = {
  type?: string
  search?: string
  leadSource?: string
  tag?: string
}

// Helper function to validate UUID format
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export const personService = {
  async getPeople(filters?: PersonFilters): Promise<Person[]> {
    try {
      let query = supabase.from("people").select("*").order("updated_at", { ascending: false })

      // Apply filters
      if (filters?.type && filters.type !== "all") {
        // Convert to proper case to match database values (e.g., "lead" -> "Lead")
        query = query.eq("person_type", filters.type.charAt(0).toUpperCase() + filters.type.slice(1).toLowerCase() as PersonType)
      }

      if (filters?.leadSource) {
        query = query.eq("lead_source", filters.leadSource)
      }

      if (filters?.tag) {
        // Filter by tag using the contains operator for array fields
        query = query.contains("tags", [filters.tag])
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.or(
          `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},business_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`,
        )
      }

      const { data, error } = await query

      if (error) throw error
      // Explicitly cast the data to Person[] to match the expected return type
      return data as Person[] || []
    } catch (error) {
      console.error("Error fetching people from Supabase:", error);
      throw new Error(handleSupabaseError(error));
    }
  },

  async getPersonById(id: string, supabaseClient = supabase): Promise<Person | null> {
    try {
      if (!isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

      const { data, error } = await supabaseClient.from("people").select("*").eq("id", id).single()

      if (error) throw error
      // Explicitly cast the data to Person | null
      return data as Person | null
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createPerson(person: NewPerson): Promise<Person> {
    try {
      const personData = {
        ...person,
        // Ensure person_type is a valid PersonType value
        person_type: (person.person_type.charAt(0).toUpperCase() + person.person_type.slice(1).toLowerCase()) as PersonType,
      }

      const { data, error } = await supabase.from("people").insert(personData).select().single()

      if (error) throw error
      // Explicitly cast the data to Person
      return data as Person
    } catch (error) {
      console.error("Create person error:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePerson(id: string, updates: UpdatePerson): Promise<Person> {
    try {
      if (!isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

      const updateData: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      }

      if (updates.person_type) {
        // Ensure person_type is a string value for the database
        updateData.person_type = updates.person_type.charAt(0).toUpperCase() + updates.person_type.slice(1).toLowerCase()
      }

      const { data, error } = await supabase.from("people").update(updateData).eq("id", id).select().single()

      if (error) throw error
      // Explicitly cast the data to Person
      return data as Person
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deletePerson(id: string): Promise<void> {
    try {
      // Validate UUID format before deleting
      if (!isValidUUID(id)) {
        throw new Error(`Invalid UUID format: ${id}`)
      }

      const { error } = await supabase.from("people").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper function to get a formatted display name
  getDisplayName(person: Person): string {
    if (person.business_name) {
      return person.business_name
    }

    const firstName = person.first_name || ""
    const lastName = person.last_name || ""

    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim()
    }

    return "Unnamed Contact"
  },

  // Helper function to get the display version of person_type (lowercase and capitalized)
  getDisplayType(personType: string): string {
    return personType.charAt(0).toUpperCase() + personType.slice(1).toLowerCase()
  },
}
