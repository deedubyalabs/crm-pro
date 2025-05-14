import type { Database } from "./supabase"
import type { Project } from "./projects"
import type { Job } from "./jobs"

export type ResourceType = Database["public"]["Tables"]["resource_types"]["Row"]
export type NewResourceType = Database["public"]["Tables"]["resource_types"]["Insert"]
export type UpdateResourceType = Database["public"]["Tables"]["resource_types"]["Update"]

export type Resource = Database["public"]["Tables"]["resources"]["Row"]
export type NewResource = Database["public"]["Tables"]["resources"]["Insert"]
export type UpdateResource = Database["public"]["Tables"]["resources"]["Update"]

export type TaskTemplate = Database["public"]["Tables"]["task_templates"]["Row"]
export type NewTaskTemplate = Database["public"]["Tables"]["task_templates"]["Insert"]
export type UpdateTaskTemplate = Database["public"]["Tables"]["task_templates"]["Update"]

export type ProjectTask = Database["public"]["Tables"]["project_tasks"]["Row"]
export type NewProjectTask = Database["public"]["Tables"]["project_tasks"]["Insert"]
export type UpdateProjectTask = Database["public"]["Tables"]["project_tasks"]["Update"]

export type TaskDependency = Database["public"]["Tables"]["task_dependencies"]["Row"]
export type NewTaskDependency = Database["public"]["Tables"]["task_dependencies"]["Insert"]
export type UpdateTaskDependency = Database["public"]["Tables"]["task_dependencies"]["Update"]

export type ResourceAssignment = Database["public"]["Tables"]["resource_assignments"]["Row"]
export type NewResourceAssignment = Database["public"]["Tables"]["resource_assignments"]["Insert"]
export type UpdateResourceAssignment = Database["public"]["Tables"]["resource_assignments"]["Update"]

export type SchedulingConstraint = Database["public"]["Tables"]["scheduling_constraints"]["Row"]
export type NewSchedulingConstraint = Database["public"]["Tables"]["scheduling_constraints"]["Insert"]
export type UpdateSchedulingConstraint = Database["public"]["Tables"]["scheduling_constraints"]["Update"]

export type WeatherData = Database["public"]["Tables"]["weather_data"]["Row"]
export type NewWeatherData = Database["public"]["Tables"]["weather_data"]["Insert"]
export type UpdateWeatherData = Database["public"]["Tables"]["weather_data"]["Update"]

export type WeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Row"]
export type NewWeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Insert"]
export type UpdateWeatherImpactRule = Database["public"]["Tables"]["weather_impact_rules"]["Update"]

export type SchedulingHistory = Database["public"]["Tables"]["scheduling_history"]["Row"]
export type NewSchedulingHistory = Database["public"]["Tables"]["scheduling_history"]["Insert"]

export type SchedulingConflict = Database["public"]["Tables"]["scheduling_conflicts"]["Row"]
export type NewSchedulingConflict = Database["public"]["Tables"]["scheduling_conflicts"]["Insert"]
export type UpdateSchedulingConflict = Database["public"]["Tables"]["scheduling_conflicts"]["Update"]

export type TaskStatus = "not_started" | "in_progress" | "completed" | "delayed" | "cancelled"
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

export interface ProjectTaskWithDetails extends ProjectTask {
  project?: Project
  job?: Job
  dependencies?: TaskDependency[]
  dependents?: TaskDependency[]
  resourceAssignments?: ResourceAssignment[]
  constraints?: SchedulingConstraint[]
}

export interface ResourceWithAssignments extends Resource {
  type?: ResourceType
  assignments?: ResourceAssignment[]
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
  criticalPath: ProjectTask[]
  bottleneckResources: Resource[]
  delayRisks: {
    task: ProjectTask
    riskFactor: number
    reasons: string[]
  }[]
  resourceUtilization: {
    resource: Resource
    utilizationPercentage: number
  }[]
  weatherImpacts: {
    date: string
    affectedTasks: ProjectTask[]
    impact: string
  }[]
  conflicts: SchedulingConflict[]
}
