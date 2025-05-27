import type { Database } from "./supabase"
import type { Project } from "@/types/project"
import type { Job, JobWithAssignedToUser } from "@/types/job"

export type TaskTemplate = Database["public"]["Tables"]["task_templates"]["Row"]
export type NewTaskTemplate = Database["public"]["Tables"]["task_templates"]["Insert"]
export type UpdateTaskTemplate = Database["public"]["Tables"]["task_templates"]["Update"]

export type JobDependency = Database["public"]["Tables"]["job_dependencies"]["Row"]
export type NewJobDependency = Database["public"]["Tables"]["job_dependencies"]["Insert"]
export type UpdateJobDependency = Database["public"]["Tables"]["job_dependencies"]["Update"]

export type SchedulingConstraint = Omit<Database["public"]["Tables"]["scheduling_constraints"]["Row"], "task_id"> & {
  job_id: string | null;
};
export type NewSchedulingConstraint = Omit<Database["public"]["Tables"]["scheduling_constraints"]["Insert"], "task_id"> & {
  job_id?: string | null;
};
export type UpdateSchedulingConstraint = Omit<Database["public"]["Tables"]["scheduling_constraints"]["Update"], "task_id"> & {
  job_id?: string | null;
};

export type WeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Row"]
export type NewWeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Insert"]
export type UpdateWeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Update"]

export type SchedulingConflict = Omit<Database["public"]["Tables"]["scheduling_conflicts"]["Row"], "affected_tasks"> & {
  affected_jobs: string[] | null;
};
export type NewSchedulingConflict = Omit<Database["public"]["Tables"]["scheduling_conflicts"]["Insert"], "affected_tasks"> & {
  affected_jobs?: string[] | null;
};
export type UpdateSchedulingConflict = Omit<Database["public"]["Tables"]["scheduling_conflicts"]["Update"], "affected_tasks"> & {
  affected_jobs?: string[] | null;
};

export interface ScheduleGenerationRequest {
  projectId: string;
  optimizationOptions?: ScheduleOptimizationOptions;
  // Add other relevant fields for schedule generation request
}

export interface ScheduleGenerationResult {
  success: boolean;
  message: string;
  generated_schedule_id?: string;
  // Add other relevant fields for schedule generation result
}

export type JobStatus = "not_started" | "in_progress" | "completed" | "delayed" | "cancelled"
export type DependencyType = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish"
export type ConstraintType =
  | "must_start_on"
  | "must_finish_by"
  | "not_earlier_than"
  | "not_later_than"
  | "fixed_duration"
export type WeatherCondition = "clear" | "cloudy" | "rain" | "snow" | "fog" | "wind" | "storm"
export type ImpactType = "delay" | "cancel" | "reduce_productivity"
export type ConflictType =
  | "resource_overallocation"
  | "dependency_violation"
  | "constraint_violation"
  | "weather_impact"
export type ResolutionStatus = "unresolved" | "auto_resolved" | "manually_resolved" | "ignored"

export interface ProjectJobWithDetails extends Job {
  project?: Project | null
  dependencies?: JobDependency[]
  dependents?: JobDependency[]
  constraints?: SchedulingConstraint[]
}
export interface ScheduleOptimizationOptions {
  prioritizeByDeadline?: boolean
  prioritizeByDependencies?: boolean
  prioritizeByResourceAvailability?: boolean
  considerWeather?: boolean
  balanceResourceLoad?: boolean
  minimizeProjectDuration?: boolean
  respectConstraints?: boolean
  allowPartialAssignments?: boolean
}

export interface ScheduleAnalysisResult {
  criticalPath: Job[]
  delayRisks: {
    job: Job
    riskFactor: number
    reasons: string[]
  }[]
  weatherImpacts: {
    date: string
    affectedJobs: Job[]
    impact: string
  }[]
  conflicts: SchedulingConflict[]
}
