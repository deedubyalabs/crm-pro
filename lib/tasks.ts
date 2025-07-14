import { supabase, handleSupabaseError } from "./supabase";
import type { Task, TaskWithRelations, CreateTaskParams, UpdateTaskParams, TaskType, TaskStatus } from "@/types/tasks";

export async function getTasks(): Promise<TaskWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      type: task.type as TaskType | null,
      status: task.status as TaskStatus | null,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getTaskById(id: string): Promise<TaskWithRelations | null> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw error;
    }
    return data ? {
      ...data,
      type: data.type as TaskType | null,
      status: data.status as TaskStatus | null,
    } : null;
  } catch (error) {
    console.error("Error fetching task by ID:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function createTask(task: CreateTaskParams): Promise<string> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        ...task,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function updateTask(id: string, task: UpdateTaskParams): Promise<void> {
  try {
    const { error } = await supabase
      .from("tasks")
      .update({
        ...task,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getTasksByDateRange(
  startDate: string,
  endDate: string,
): Promise<TaskWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .gte("start_time", startDate)
      .lte("end_time", endDate)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      type: task.type as TaskType | null,
      status: task.status as TaskStatus | null,
    }));
  } catch (error) {
    console.error("Error fetching tasks by date range:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getTasksByPerson(personId: string): Promise<TaskWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .eq("person_id", personId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      type: task.type as TaskType | null,
      status: task.status as TaskStatus | null,
    }));
  } catch (error) {
    console.error("Error fetching tasks by person:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getTasksByProject(projectId: string): Promise<TaskWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      type: task.type as TaskType | null,
      status: task.status as TaskStatus | null,
    }));
  } catch (error) {
    console.error("Error fetching tasks by project:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export async function getTasksByOpportunity(opportunityId: string): Promise<TaskWithRelations[]> {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(`
        id,
        task_name,
        type,
        opportunity_id,
        project_id,
        person_id,
        start_time,
        end_time,
        status,
        notes,
        created_at,
        updated_at,
        opportunity:opportunities(opportunity_name),
        project:projects(project_name),
        person:people(first_name, last_name)
      `)
      .eq("opportunity_id", opportunityId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []).map(task => ({
      ...task,
      type: task.type as TaskType | null,
      status: task.status as TaskStatus | null,
    }));
  } catch (error) {
    console.error("Error fetching tasks by opportunity:", error);
    throw new Error(handleSupabaseError(error));
  }
}

export const taskService = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTasksByDateRange,
  getTasksByPerson,
  getTasksByProject,
  getTasksByOpportunity,
};
