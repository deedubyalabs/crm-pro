import { supabase, handleSupabaseError } from "../supabase"
import type { Job, NewJob, UpdateJob, JobWithAssignedToUser } from "@/types/job"
import type { JobDependency, SchedulingConstraint } from "@/types/scheduler"
import type { Database, Tables } from "@/types/supabase"
type Person = Tables<{ schema: 'public' }, 'people'>;

export const projectJobService = {
  async createProjectJob(job: NewJob): Promise<Job> {
    try {
      const { data, error } = await supabase.from("jobs").insert(job).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateProjectJob(id: string, updates: UpdateJob): Promise<Job> {
    try {
      const { data, error } = await supabase
        .from("jobs")
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

  async deleteProjectJob(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("jobs").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getProjectJobs(
    options: { projectId?: string; jobId?: string; status?: string } = {},
  ): Promise<JobWithAssignedToUser[]> {
    try {
      let query = supabase.from("jobs").select(`
        *,
        project:project_id (*)
      `)

      if (options.projectId) {
        query = query.eq("project_id", options.projectId)
      }

      if (options.jobId) {
        query = query.eq("id", options.jobId)
      }

      if (options.status) {
        query = query.eq("status", options.status as Database["public"]["Enums"]["job_status"])
      }

      const { data: jobsData, error: jobsError } = await query.order("scheduled_start_date", { ascending: true })

      if (jobsError) throw jobsError
      const jobs = jobsData || [];

      // Get all people to map assigned_to_user
      const { data: people, error: peopleError } = await supabase.from("people").select("*")
      if (peopleError) throw peopleError

      // Get dependencies for all jobs
      const jobIds = jobs.map((job) => job.id)
      const { data: dependenciesData, error: depError } = await supabase
        .from("job_dependencies")
        .select("*")
        .in("predecessor_job_id", jobIds)
        .or(`successor_job_id.in.(${jobIds.join(",")})`)

      if (depError) throw depError
      const dependencies = dependenciesData || [];

      // Get resource assignments for all jobs (assuming resource_assignments still exists for now)
      // Note: resource_assignments table was removed, this section needs to be updated or removed if not replaced by another mechanism
      // For now, commenting out to avoid errors, will revisit if resource assignments are reintroduced
      // const { data: assignmentsData, error: assignError } = await supabase
      //   .from("resource_assignments")
      //   .select(`
      //     *,
      //     resource:resource_id (*)
      //   `)
      //   .in("job_id", jobIds)

      // if (assignError) throw assignError
      // const assignments = assignmentsData || [];

      // Get constraints for all jobs
      const { data: constraintsData, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .in("job_id", jobIds)

      if (constError) throw constError
      const constraints = constraintsData || [];

      // Combine all data
      const jobsWithDetails = jobs.map((job) => {
        const jobDependencies = dependencies?.filter(
          (dep) => dep.predecessor_job_id === job.id || dep.successor_job_id === job.id,
        )
        // const jobAssignments = assignments?.filter((assign) => assign.job_id === job.id)
        const jobConstraints = constraints?.filter((constraint) => constraint.job_id === job.id)

        // Manually attach assigned_to_user to the job object
        const jobWithAssignedUser = {
          ...job,
          assigned_to_user: people?.find(p => p.id === job.assigned_to) || null
        };

        return {
          ...jobWithAssignedUser,
          dependencies: jobDependencies?.filter((dep) => dep.predecessor_job_id === job.id) || [],
          dependents: jobDependencies?.filter((dep) => dep.successor_job_id === job.id) || [],
          // resourceAssignments: jobAssignments || [], // Commented out
          constraints: jobConstraints || [],
        }
      })

      return jobsWithDetails as JobWithAssignedToUser[] // Cast to JobWithAssignedToUser[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getProjectJobById(id: string): Promise<JobWithAssignedToUser | null> {
    try {
      const { data: job, error } = await supabase
        .from("jobs")
        .select(`
          *,
          project:project_id (*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!job) return null

      // Get dependencies
      const { data: dependencies, error: depError } = await supabase
        .from("job_dependencies")
        .select("*")
        .or(`predecessor_job_id.eq.${id},successor_job_id.eq.${id}`)

      if (depError) throw depError

      // Get resource assignments (assuming resource_assignments still exists for now)
      // Note: resource_assignments table was removed, this section needs to be updated or removed if not replaced by another mechanism
      // For now, commenting out to avoid errors, will revisit if resource assignments are reintroduced
      // const { data: assignments, error: assignError } = await supabase
      //   .from("resource_assignments")
      //   .select(`
      //     *,
      //     resource:resource_id (*)
      //   `)
      //   .eq("job_id", id)

      // if (assignError) throw assignError
      // const assignments = assignments || [];

      // Get constraints
      const { data: constraints, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .eq("job_id", id)

      if (constError) throw constError

      // Get all people to map assigned_to_user
      const { data: people, error: peopleError } = await supabase.from("people").select("*")
      if (peopleError) throw peopleError

      const jobWithAssignedUser = {
        ...job,
        assigned_to_user: people?.find(p => p.id === job.assigned_to) || null
      };

      return {
        ...jobWithAssignedUser,
        dependencies: dependencies?.filter((dep) => dep.predecessor_job_id === id) || [],
        dependents: dependencies?.filter((dep) => dep.successor_job_id === id) || [],
        constraints: constraints || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
