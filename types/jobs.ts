import { Database } from "@/types/supabase";
import { Person } from "@/types/people";
import { Opportunity } from "@/types/opportunities";
import { Project } from "@/types/project";

export type Job = Database["public"]["Tables"]["jobs"]["Row"];
export type NewJob = Database["public"]["Tables"]["jobs"]["Insert"];
export type UpdateJob = Database["public"]["Tables"]["jobs"]["Update"];

export enum JobStatus {
  Pending = "Pending",
  InProgress = "In Progress",
  OnHold = "On Hold",
  Completed = "Completed",
}

export type JobWithRelations = Job & {
  project?: Project | null;
  assigned_to_person?: Person | null; // Assuming 'assigned_to' links to people
  linked_contact?: Person | null; // Assuming 'linked_contact_id' links to people
  linked_opportunity?: Opportunity | null; // Assuming 'linked_opportunity_id' links to opportunities
  blocked_by_job?: Job | null; // Self-referencing for dependencies
  blocking_job?: Job | null; // Self-referencing for dependencies
};
