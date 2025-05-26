import type { Database } from "./supabase"

export type Job = Database["public"]["Tables"]["jobs"]["Row"]
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"]
export type UpdateJob = Database["public"]["Tables"]["jobs"]["Update"]
export type JobChecklistItem = Database["public"]["Tables"]["job_checklist_items"]["Row"]

export type CreateJobPayload = Omit<Job, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: Job['status'];
};

export type UpdateJobPayload = Partial<Omit<Job, 'id' | 'created_at' | 'updated_at'>>;

export type CreateJobChecklistItemPayload = Omit<JobChecklistItem, 'id' | 'created_at'>;
export type UpdateJobChecklistItemPayload = Partial<Omit<JobChecklistItem, 'id' | 'created_at'>>;
