import type { Database } from "./supabase"
import type { Tables } from "./supabase" // Import Tables type from supabase

export type Person = Tables<'people'>; // Define Person type from supabase tables

export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export interface JobWithAssignedToUser extends Job {
  project: any;
  assigned_to_user?: Person | null; // Made optional
}
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"]
export type UpdateJob = Database["public"]["Tables"]["jobs"]["Update"]
export interface JobChecklistItem {
  id: string;
  job_id: string;
  description: string;
  is_complete: boolean;
  created_at?: string; // Make created_at optional
}
export type JobChecklistItemRow = Database["public"]["Tables"]["job_checklist_items"]["Row"];

export type CreateJobPayload = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: Job['status'];
};

export type UpdateJobPayload = Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>;

export type CreateJobChecklistItemPayload = Omit<JobChecklistItem, 'id' | 'created_at'>;
export type UpdateJobChecklistItemPayload = Partial<Omit<JobChecklistItem, 'id' | 'created_at'>>;
