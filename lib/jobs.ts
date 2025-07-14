import { supabase, handleSupabaseError } from "@/lib/supabase";
import { Job, JobWithRelations, NewJob, UpdateJob, JobStatus } from "@/types/jobs";

export const jobService = {
  /**
   * Fetches all jobs for a specific project.
   * @param projectId The ID of the project.
   * @returns A list of jobs with relations.
   */
  async getJobsByProjectId(projectId: string): Promise<JobWithRelations[]> {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        project:projects!inner(project_name),
        assigned_to_person:people!jobs_assigned_to_fkey(first_name, last_name),
        linked_contact:people!jobs_linked_contact_id_fkey(first_name, last_name),
        linked_opportunity:opportunities!jobs_linked_opportunity_id_fkey(opportunity_name)
        `
      )
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });

    if (error) {
      handleSupabaseError(error);
    }
    return (data as JobWithRelations[]) || [];
  },

  /**
   * Fetches a single job by its ID.
   * @param jobId The ID of the job.
   * @returns The job with relations, or null if not found.
   */
  async getJobById(jobId: string): Promise<JobWithRelations | null> {
    const { data, error } = await supabase
      .from("jobs")
      .select(
        `
        *,
        project:projects!inner(project_name),
        assigned_to_person:people!jobs_assigned_to_fkey(first_name, last_name),
        linked_contact:people!jobs_linked_contact_id_fkey(first_name, last_name),
        linked_opportunity:opportunities!jobs_linked_opportunity_id_fkey(opportunity_name)
        `
      )
      .eq("id", jobId)
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return (data as JobWithRelations) || null;
  },

  /**
   * Creates a new job.
   * @param newJob The job data to create.
   * @returns The created job.
   */
  async createJob(newJob: NewJob): Promise<Job> {
    const { data, error } = await supabase
      .from("jobs")
      .insert(newJob)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data as Job;
  },

  /**
   * Updates an existing job.
   * @param jobId The ID of the job to update.
   * @param updatedFields The fields to update.
   * @returns The updated job.
   */
  async updateJob(jobId: string, updatedFields: UpdateJob): Promise<Job> {
    const { data, error } = await supabase
      .from("jobs")
      .update(updatedFields)
      .eq("id", jobId)
      .select()
      .single();

    if (error) {
      handleSupabaseError(error);
    }
    return data as Job;
  },

  /**
   * Deletes a job by its ID.
   * @param jobId The ID of the job to delete.
   */
  async deleteJob(jobId: string): Promise<void> {
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId);

    if (error) {
      handleSupabaseError(error);
    }
  },
};
