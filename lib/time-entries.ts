import { supabase, handleSupabaseError } from "./supabase"
import type { TimeEntryWithDetails, CreateTimeEntryParams, UpdateTimeEntryParams } from "@/types/time-entries"

export async function getTimeEntries(): Promise<TimeEntryWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(project_name),
        job:jobs(name, hourly_rate),
        person:people(first_name, last_name)
      `)
      .order("date", { ascending: false })

    if (error) throw error
    return (data || []).map(entry => ({
      ...entry,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || new Date().toISOString()
    }))
  } catch (error) {
    console.error("Error fetching time entries:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getTimeEntriesByProject(projectId: string): Promise<TimeEntryWithDetails[]> {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(project_name),
        job:jobs(name, hourly_rate),
        person:people(first_name, last_name)
      `)
      .eq("project_id", projectId)
      .order("date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Error fetching time entries by project:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getTimeEntryById(id: string): Promise<TimeEntryWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(project_name),
        job:jobs(name, hourly_rate),
        person:people(first_name, last_name)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }
    return data
  } catch (error) {
    console.error("Error fetching time entry by ID:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function createTimeEntry(timeEntry: CreateTimeEntryParams): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        ...timeEntry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) throw error
    return data.id
  } catch (error) {
    console.error("Error creating time entry:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateTimeEntry(id: string, timeEntry: UpdateTimeEntryParams): Promise<void> {
  try {
    const { error } = await supabase
      .from("time_entries")
      .update({
        ...timeEntry,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error updating time entry:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function deleteTimeEntry(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("time_entries").delete().eq("id", id)

    if (error) throw error
  } catch (error) {
    console.error("Error deleting time entry:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export async function getBillableTimeEntriesByProject(
  projectId: string,
  unbilledOnly = false,
): Promise<TimeEntryWithDetails[]> {
  try {
    let query = supabase
      .from("time_entries")
      .select(`
        *,
        project:projects(project_name),
        job:jobs(name, hourly_rate),
        person:people(first_name, last_name)
      `)
      .eq("project_id", projectId)
      .eq("billable", true)

    if (unbilledOnly) {
      query = query.eq("billed", false)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) throw error
    return (data || []).map(entry => ({
      ...entry,
      created_at: entry.created_at || new Date().toISOString(),
      updated_at: entry.updated_at || new Date().toISOString()
    }))
  } catch (error) {
    console.error("Error fetching billable time entries:", error)
    throw new Error(handleSupabaseError(error))
  }
}

export const timeEntryService = {
  getTimeEntries,
  getTimeEntriesByProject,
  getTimeEntryById,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getBillableTimeEntriesByProject,
}
