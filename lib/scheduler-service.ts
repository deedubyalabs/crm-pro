import { supabase, handleSupabaseError } from "./supabase"
import { projectService } from "./projects"
import { weatherService } from "./weather-service"
import type {
  ResourceType,
  NewResourceType,
  UpdateResourceType,
  Resource,
  NewResource,
  UpdateResource,
  TaskTemplate,
  NewTaskTemplate,
  UpdateTaskTemplate,
  ProjectTask,
  NewProjectTask,
  UpdateProjectTask,
  TaskDependency,
  NewTaskDependency,
  UpdateTaskDependency,
  ResourceAssignment,
  NewResourceAssignment,
  UpdateResourceAssignment,
  SchedulingConstraint,
  NewSchedulingConstraint,
  UpdateSchedulingConstraint,
  WeatherImpactRule,
  NewWeatherImpactRule,
  UpdateWeatherImpactRule,
  SchedulingConflict,
  NewSchedulingConflict,
  ProjectTaskWithDetails,
  ResourceWithAssignments,
  ScheduleOptimizationOptions,
  ScheduleAnalysisResult,
} from "@/types/scheduler"

export const schedulerService = {
  // Resource Types
  async getResourceTypes(): Promise<ResourceType[]> {
    try {
      const { data, error } = await supabase.from("resource_types").select("*").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getResourceTypeById(id: string): Promise<ResourceType | null> {
    try {
      const { data, error } = await supabase.from("resource_types").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createResourceType(resourceType: NewResourceType): Promise<ResourceType> {
    try {
      const { data, error } = await supabase.from("resource_types").insert(resourceType).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateResourceType(id: string, updates: UpdateResourceType): Promise<ResourceType> {
    try {
      const { data, error } = await supabase
        .from("resource_types")
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

  async deleteResourceType(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("resource_types").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Resources
  async getResources(options: { typeId?: string; isActive?: boolean } = {}): Promise<ResourceWithAssignments[]> {
    try {
      let query = supabase.from("resources").select(`
        *,
        type:resource_type_id (*)
      `)

      if (options.typeId) {
        query = query.eq("resource_type_id", options.typeId)
      }

      if (options.isActive !== undefined) {
        query = query.eq("is_active", options.isActive)
      }

      const { data, error } = await query.order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getResourceById(id: string): Promise<ResourceWithAssignments | null> {
    try {
      const { data, error } = await supabase
        .from("resources")
        .select(`
          *,
          type:resource_type_id (*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createResource(resource: NewResource): Promise<Resource> {
    try {
      const { data, error } = await supabase.from("resources").insert(resource).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateResource(id: string, updates: UpdateResource): Promise<Resource> {
    try {
      const { data, error } = await supabase
        .from("resources")
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

  async deleteResource(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("resources").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Task Templates
  async getTaskTemplates(): Promise<TaskTemplate[]> {
    try {
      const { data, error } = await supabase.from("task_templates").select("*").order("name")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getTaskTemplateById(id: string): Promise<TaskTemplate | null> {
    try {
      const { data, error } = await supabase.from("task_templates").select("*").eq("id", id).single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createTaskTemplate(template: NewTaskTemplate): Promise<TaskTemplate> {
    try {
      const { data, error } = await supabase.from("task_templates").insert(template).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateTaskTemplate(id: string, updates: UpdateTaskTemplate): Promise<TaskTemplate> {
    try {
      const { data, error } = await supabase
        .from("task_templates")
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

  async deleteTaskTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("task_templates").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Project Tasks
  async getProjectTasks(
    options: { projectId?: string; jobId?: string; status?: string } = {},
  ): Promise<ProjectTaskWithDetails[]> {
    try {
      let query = supabase.from("project_tasks").select(`
        *,
        project:project_id (*),
        job:job_id (*)
      `)

      if (options.projectId) {
        query = query.eq("project_id", options.projectId)
      }

      if (options.jobId) {
        query = query.eq("job_id", options.jobId)
      }

      if (options.status) {
        query = query.eq("status", options.status)
      }

      const { data: tasksData, error: tasksError } = await query.order("scheduled_start", { ascending: true })

      if (tasksError) throw tasksError
      const tasks = tasksData || [];

      // Get all people to map assigned_to_user
      const { data: people, error: peopleError } = await supabase.from("people").select("*")
      if (peopleError) throw peopleError

      // Get dependencies for all tasks
      const taskIds = tasks.map((task) => task.id)
      const { data: dependenciesData, error: depError } = await supabase
        .from("task_dependencies")
        .select("*")
        .in("predecessor_task_id", taskIds)
        .or(`successor_task_id.in.(${taskIds.join(",")})`)

      if (depError) throw depError
      const dependencies = dependenciesData || [];

      // Get resource assignments for all tasks
      const { data: assignmentsData, error: assignError } = await supabase
        .from("resource_assignments")
        .select(`
          *,
          resource:resource_id (*)
        `)
        .in("task_id", taskIds)

      if (assignError) throw assignError
      const assignments = assignmentsData || [];

      // Get constraints for all tasks
      const { data: constraintsData, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .in("task_id", taskIds)

      if (constError) throw constError
      const constraints = constraintsData || [];

      // Combine all data
      const tasksWithDetails = tasks.map((task) => {
        const taskDependencies = dependencies?.filter(
          (dep) => dep.predecessor_task_id === task.id || dep.successor_task_id === task.id,
        )
        const taskAssignments = assignments?.filter((assign) => assign.task_id === task.id)
        const taskConstraints = constraints?.filter((constraint) => constraint.task_id === task.id)

        // Manually attach assigned_to_user to the job object
        const jobWithAssignedUser = task.job ? {
          ...task.job,
          assigned_to_user: people?.find(p => p.id === task.job?.assigned_to) || null
        } : null;

        return {
          ...task,
          job: jobWithAssignedUser,
          dependencies: taskDependencies?.filter((dep) => dep.predecessor_task_id === task.id) || [],
          dependents: taskDependencies?.filter((dep) => dep.successor_task_id === task.id) || [],
          resourceAssignments: taskAssignments || [],
          constraints: taskConstraints || [],
        }
      })

      return tasksWithDetails
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getProjectTaskById(id: string): Promise<ProjectTaskWithDetails | null> {
    try {
      const { data: task, error } = await supabase
        .from("project_tasks")
        .select(`
          *,
          project:project_id (*),
          job:job_id (*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!task) return null

      // Get dependencies
      const { data: dependencies, error: depError } = await supabase
        .from("task_dependencies")
        .select("*")
        .or(`predecessor_task_id.eq.${id},successor_task_id.eq.${id}`)

      if (depError) throw depError

      // Get resource assignments
      const { data: assignments, error: assignError } = await supabase
        .from("resource_assignments")
        .select(`
          *,
          resource:resource_id (*)
        `)
        .eq("task_id", id)

      if (assignError) throw assignError

      // Get constraints
      const { data: constraints, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .eq("task_id", id)

      if (constError) throw constError

      return {
        ...task,
        dependencies: dependencies?.filter((dep) => dep.predecessor_task_id === id) || [],
        dependents: dependencies?.filter((dep) => dep.successor_task_id === id) || [],
        resourceAssignments: assignments || [],
        constraints: constraints || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createProjectTask(task: NewProjectTask): Promise<ProjectTask> {
    try {
      const { data, error } = await supabase.from("project_tasks").insert(task).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateProjectTask(id: string, updates: UpdateProjectTask): Promise<ProjectTask> {
    try {
      const { data, error } = await supabase
        .from("project_tasks")
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

  async deleteProjectTask(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("project_tasks").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Task Dependencies
  async createTaskDependency(dependency: NewTaskDependency): Promise<TaskDependency> {
    try {
      const { data, error } = await supabase.from("task_dependencies").insert(dependency).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateTaskDependency(id: string, updates: UpdateTaskDependency): Promise<TaskDependency> {
    try {
      const { data, error } = await supabase
        .from("task_dependencies")
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

  async deleteTaskDependency(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("task_dependencies").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Resource Assignments
  async createResourceAssignment(assignment: NewResourceAssignment): Promise<ResourceAssignment> {
    try {
      const { data, error } = await supabase.from("resource_assignments").insert(assignment).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateResourceAssignment(id: string, updates: UpdateResourceAssignment): Promise<ResourceAssignment> {
    try {
      const { data, error } = await supabase
        .from("resource_assignments")
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

  async deleteResourceAssignment(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("resource_assignments").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Scheduling Constraints
  async createSchedulingConstraint(constraint: NewSchedulingConstraint): Promise<SchedulingConstraint> {
    try {
      const { data, error } = await supabase.from("scheduling_constraints").insert(constraint).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateSchedulingConstraint(id: string, updates: UpdateSchedulingConstraint): Promise<SchedulingConstraint> {
    try {
      const { data, error } = await supabase
        .from("scheduling_constraints")
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

  async deleteSchedulingConstraint(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("scheduling_constraints").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Weather Impact Rules
  async getWeatherImpactRules(): Promise<WeatherImpactRule[]> {
    try {
      const { data, error } = await supabase.from("weather_impact_rules").select(`
          *,
          taskTemplate:task_template_id (*)
        `)

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createWeatherImpactRule(rule: NewWeatherImpactRule): Promise<WeatherImpactRule> {
    try {
      const { data, error } = await supabase.from("weather_impact_rules").insert(rule).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateWeatherImpactRule(id: string, updates: UpdateWeatherImpactRule): Promise<WeatherImpactRule> {
    try {
      const { data, error } = await supabase
        .from("weather_impact_rules")
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

  async deleteWeatherImpactRule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("weather_impact_rules").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Scheduling Conflicts
  async getSchedulingConflicts(projectId: string): Promise<SchedulingConflict[]> {
    try {
      const { data, error } = await supabase
        .from("scheduling_conflicts")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async resolveSchedulingConflict(
    id: string,
    resolution: { status: string; description: string },
  ): Promise<SchedulingConflict> {
    try {
      const { data, error } = await supabase
        .from("scheduling_conflicts")
        .update({
          resolution_status: resolution.status,
          resolution_description: resolution.description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Advanced Scheduling Functions
  async generateProjectSchedule(
    projectId: string,
    options: {
      startDate?: string
      useTemplates?: boolean
      includeWeatherData?: boolean
    } = {},
  ): Promise<ProjectTaskWithDetails[]> {
    try {
      // Get project details
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get task templates if requested
      let templates: TaskTemplate[] = []
      if (options.useTemplates) {
        const { data, error } = await supabase.from("task_templates").select("*").order("name")
        if (error) throw error
        templates = data || []
      }

      // Get existing jobs for this project
      const jobs = await projectService.getProjectJobs(projectId)

      // Start date defaults to project planned start date or today
      const startDate = options.startDate || project.planned_start_date || new Date().toISOString()
      let currentDate = new Date(startDate)

      // Create tasks based on templates or basic structure
      const tasks: NewProjectTask[] = []
      const dependencies: NewTaskDependency[] = []

      if (options.useTemplates && templates.length > 0) {
        // Use templates to create tasks
        const lastTaskId: string | null = null
        const taskIdMap: Record<string, string> = {}

        for (const template of templates) {
          const taskId = crypto.randomUUID()
          taskIdMap[template.id] = taskId

          // Calculate duration in days (template duration is in minutes)
          const durationDays = Math.ceil(template.estimated_duration / (8 * 60)) // Assuming 8-hour workdays

          // Calculate end date
          const endDate = new Date(currentDate)
          endDate.setDate(endDate.getDate() + durationDays)

          // Create task
          tasks.push({
            id: taskId,
            project_id: projectId,
            task_template_id: template.id,
            name: template.name,
            description: template.description,
            status: "not_started",
            estimated_duration: template.estimated_duration,
            scheduled_start: currentDate.toISOString(),
            scheduled_end: endDate.toISOString(),
          })

          // Add dependencies from template
          if (template.predecessor_templates) {
            const predecessors = template.predecessor_templates as any
            if (predecessors.predecessors && Array.isArray(predecessors.predecessors)) {
              for (const predName of predecessors.predecessors) {
                const predTemplate = templates.find((t) => t.name === predName)
                if (predTemplate && taskIdMap[predTemplate.id]) {
                  dependencies.push({
                    predecessor_task_id: taskIdMap[predTemplate.id],
                    successor_task_id: taskId,
                    dependency_type: "finish_to_start",
                  })
                }
              }
            }
          }

          // Update current date for next task
          currentDate = new Date(endDate)
        }
      } else if (jobs.length > 0) {
        // Create tasks based on jobs
        for (const job of jobs) {
          const taskId = crypto.randomUUID()

          // Calculate duration based on job dates or default to 1 day
          let durationDays = 1
          if (job.scheduled_start_date && job.scheduled_end_date) {
            const start = new Date(job.scheduled_start_date)
            const end = new Date(job.scheduled_end_date)
            durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          }

          // Calculate end date
          const endDate = new Date(currentDate)
          endDate.setDate(endDate.getDate() + durationDays)

          // Create task
          tasks.push({
            id: taskId,
            project_id: projectId,
            job_id: job.id,
            name: job.name,
            description: job.description,
            status: "not_started",
            estimated_duration: durationDays * 8 * 60, // Convert days to minutes
            scheduled_start: currentDate.toISOString(),
            scheduled_end: endDate.toISOString(),
          })

          // Update current date for next task
          currentDate = new Date(endDate)
        }
      } else {
        // Create basic tasks if no templates or jobs
        const basicTasks = ["Project Initiation", "Planning", "Execution", "Monitoring", "Project Closure"]

        for (const taskName of basicTasks) {
          const taskId = crypto.randomUUID()

          // Default to 5-day duration
          const endDate = new Date(currentDate)
          endDate.setDate(endDate.getDate() + 5)

          // Create task
          tasks.push({
            id: taskId,
            project_id: projectId,
            name: taskName,
            status: "not_started",
            estimated_duration: 5 * 8 * 60, // 5 days in minutes
            scheduled_start: currentDate.toISOString(),
            scheduled_end: endDate.toISOString(),
          })

          // Update current date for next task
          currentDate = new Date(endDate)
        }
      }

      // Insert tasks
      if (tasks.length > 0) {
        const { error: tasksError } = await supabase.from("project_tasks").insert(tasks)
        if (tasksError) throw tasksError
      }

      // Insert dependencies
      if (dependencies.length > 0) {
        const { error: depsError } = await supabase.from("task_dependencies").insert(dependencies)
        if (depsError) throw depsError
      }

      // If weather data is requested, fetch and apply weather impacts
      if (options.includeWeatherData) {
        await this.applyWeatherImpacts(projectId)
      }

      // Return the created tasks with details
      return this.getProjectTasks({ projectId })
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async optimizeSchedule(
    projectId: string,
    options: ScheduleOptimizationOptions = {},
  ): Promise<ProjectTaskWithDetails[]> {
    try {
      // Get all tasks for this project with their dependencies and resource assignments
      const tasks = await this.getProjectTasks({ projectId })
      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found for this project")
      }

      // Get all resources
      const resources = await this.getResources()

      // Build dependency graph
      const dependencyGraph: Record<string, string[]> = {}
      const reverseDependencyGraph: Record<string, string[]> = {}

      tasks.forEach((task) => {
        dependencyGraph[task.id] = []
        reverseDependencyGraph[task.id] = []
      })

      // Get all dependencies
      const { data: dependencies, error: depError } = await supabase
        .from("task_dependencies")
        .select("*")
        .eq("project_id", projectId)

      if (depError) throw depError

      dependencies?.forEach((dep) => {
        if (dependencyGraph[dep.successor_task_id]) {
          dependencyGraph[dep.successor_task_id].push(dep.predecessor_task_id)
        }
        if (reverseDependencyGraph[dep.predecessor_task_id]) {
          reverseDependencyGraph[dep.predecessor_task_id].push(dep.successor_task_id)
        }
      })

      // Get scheduling constraints
      const { data: constraints, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .eq("project_id", projectId)

      if (constError) throw constError

      // Apply optimization strategies based on options
      const updatedTasks: UpdateProjectTask[] = []

      if (options.prioritizeByDeadline) {
        // Sort tasks by deadline (scheduled_end)
        tasks.sort((a, b) => {
          if (!a.scheduled_end) return 1
          if (!b.scheduled_end) return -1
          return new Date(a.scheduled_end).getTime() - new Date(b.scheduled_end).getTime()
        })
      }

      if (options.prioritizeByDependencies) {
        // Topological sort based on dependencies
        const visited: Record<string, boolean> = {}
        const sorted: ProjectTaskWithDetails[] = []

        function visit(taskId: string) {
          if (visited[taskId]) return
          visited[taskId] = true

          dependencyGraph[taskId].forEach((depId) => {
            visit(depId)
          })

          const task = tasks.find((t) => t.id === taskId)
          if (task) sorted.push(task)
        }

        tasks.forEach((task) => {
          if (!visited[task.id]) {
            visit(task.id)
          }
        })

        // Replace tasks with sorted tasks
        tasks.length = 0
        tasks.push(...sorted)
      }

      // Schedule tasks based on dependencies and resource availability
      const currentDate = new Date()
      const taskStartDates: Record<string, Date> = {}
      const taskEndDates: Record<string, Date> = {}
      const resourceSchedule: Record<string, { start: Date; end: Date }[]> = {}

      // Initialize resource schedule
      resources.forEach((resource) => {
        resourceSchedule[resource.id] = []
      })

      // Schedule tasks
      for (const task of tasks) {
        // Find the latest end date of all predecessors
        let startDate = new Date(currentDate)
        const predecessors = dependencyGraph[task.id] || []

        if (predecessors.length > 0) {
          const predEndDates = predecessors.map((predId) => taskEndDates[predId]).filter((date) => date !== undefined)

          if (predEndDates.length > 0) {
            startDate = new Date(Math.max(...predEndDates.map((date) => date.getTime())))
          }
        }

        // Check resource availability if balancing resource load
        if (options.balanceResourceLoad && task.resourceAssignments && task.resourceAssignments.length > 0) {
          const taskResources = task.resourceAssignments.map((assign) => assign.resource_id)
          let latestResourceDate = startDate

          taskResources.forEach((resourceId) => {
            const resourceBookings = resourceSchedule[resourceId] || []
            if (resourceBookings.length > 0) {
              const latestBooking = resourceBookings[resourceBookings.length - 1]
              if (latestBooking.end > latestResourceDate) {
                latestResourceDate = new Date(latestBooking.end)
              }
            }
          })

          if (latestResourceDate > startDate) {
            startDate = latestResourceDate
          }
        }

        // Apply constraints if respecting constraints
        if (options.respectConstraints && constraints) {
          const taskConstraints = constraints.filter((c) => c.task_id === task.id)
          taskConstraints.forEach((constraint) => {
            const constraintDate = new Date(constraint.constraint_date)
            switch (constraint.constraint_type) {
              case "must_start_on":
                startDate = constraintDate
                break
              case "not_earlier_than":
                if (startDate < constraintDate) {
                  startDate = constraintDate
                }
                break
              // Other constraint types handled similarly
            }
          })
        }

        // Calculate end date based on duration
        const durationMinutes = task.estimated_duration || 480 // Default to 8 hours if not specified
        const durationDays = Math.ceil(durationMinutes / (8 * 60)) // Assuming 8-hour workdays
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + durationDays)

        // Update task with new schedule
        updatedTasks.push({
          id: task.id,
          scheduled_start: startDate.toISOString(),
          scheduled_end: endDate.toISOString(),
          updated_at: new Date().toISOString(),
        })

        // Store dates for dependency calculations
        taskStartDates[task.id] = startDate
        taskEndDates[task.id] = endDate

        // Update resource schedule
        if (task.resourceAssignments) {
          task.resourceAssignments.forEach((assign) => {
            if (resourceSchedule[assign.resource_id]) {
              resourceSchedule[assign.resource_id].push({
                start: startDate,
                end: endDate,
              })
            }
          })
        }
      }

      // Apply weather impacts if requested
      if (options.considerWeather) {
        await this.applyWeatherImpacts(projectId)
      }

      // Update tasks in database
      if (updatedTasks.length > 0) {
        for (const task of updatedTasks) {
          if (task.id !== undefined) {
            if (task.id) {
              await this.updateProjectTask(task.id, task)
            }
          }
        }
      }

      // Detect and record conflicts
      await this.detectSchedulingConflicts(projectId)

      // Return updated tasks
      return this.getProjectTasks({ projectId })
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async applyWeatherImpacts(projectId: string): Promise<void> {
    try {
      // Get project details for location
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get project tasks
      const tasks = await this.getProjectTasks({ projectId })
      if (!tasks || tasks.length === 0) return

      // Get weather impact rules
      const { data: rules, error: rulesError } = await supabase.from("weather_impact_rules").select("*")
      if (rulesError) throw rulesError

      // Get weather data for project location and date range
      const projectLocation = project.project_city || "Unknown"
      const startDate = new Date(
        Math.min(...tasks.map((t) => (t.scheduled_start ? new Date(t.scheduled_start).getTime() : Date.now()))),
      )
      const endDate = new Date(
        Math.max(...tasks.map((t) => (t.scheduled_end ? new Date(t.scheduled_end).getTime() : Date.now()))),
      )

      // Fetch weather data
      const weatherData = await weatherService.getWeatherForecast(projectLocation || "Unknown", startDate, endDate)

      // Apply weather impacts to tasks
      const updatedTasks: UpdateProjectTask[] = []

      for (const task of tasks) {
        if (!task.scheduled_start || !task.scheduled_end || !task.task_template_id) continue

        const taskStart = new Date(task.scheduled_start)
        const taskEnd = new Date(task.scheduled_end)
        let taskDelayed = false
        let delayDays = 0

        // Find applicable weather impact rules for this task
        const taskRules = rules?.filter((rule) => rule.task_template_id === task.task_template_id) || []
        if (taskRules.length === 0) continue

        // Check each day of the task against weather data
        for (let day = new Date(taskStart); day <= taskEnd; day.setDate(day.getDate() + 1)) {
          const dayStr = day.toISOString().split("T")[0]
          const dayWeather = weatherData.find((w) => w.date === dayStr)

          if (!dayWeather) continue

          // Check if weather conditions trigger any rules
          for (const rule of taskRules) {
            let impactTriggered = false

            // Check weather condition
            if (rule.weather_condition && rule.weather_condition !== dayWeather.condition) {
              continue
            }

            // Check temperature
            if (
              (rule.temperature_min !== null && dayWeather.temperature < rule.temperature_min) ||
              (rule.temperature_max !== null && dayWeather.temperature > rule.temperature_max)
            ) {
              impactTriggered = true
            }

            // Check precipitation
            if (rule.precipitation_threshold !== null && dayWeather.precipitation > rule.precipitation_threshold) {
              impactTriggered = true
            }

            // Check wind
            if (rule.wind_threshold !== null && dayWeather.windSpeed > rule.wind_threshold) {
              impactTriggered = true
            }

            // Apply impact if triggered
            if (impactTriggered) {
              switch (rule.impact_type) {
                case "delay":
                  taskDelayed = true
                  delayDays += 1
                  break
                case "cancel":
                  // Mark task as cancelled
                  updatedTasks.push({
                    id: task.id,
                    status: "cancelled",
                    updated_at: new Date().toISOString(),
                  })
                  break
                case "reduce_productivity":
                  // Extend task duration based on productivity reduction
                  const productivityImpact = rule.impact_value / 100 // Convert percentage to decimal
                  const additionalDays = Math.ceil(
                    ((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) * productivityImpact,
                  )
                  delayDays += additionalDays
                  break
              }
            }
          }
        }

        // Apply delays if needed
        if (taskDelayed && delayDays > 0) {
          const newEndDate = new Date(taskEnd)
          newEndDate.setDate(newEndDate.getDate() + delayDays)

          updatedTasks.push({
            id: task.id,
            scheduled_end: newEndDate.toISOString(),
            status: "delayed",
            updated_at: new Date().toISOString(),
          })
        }
      }

      // Update tasks in database
      if (updatedTasks.length > 0) {
        for (const task of updatedTasks) {
          await this.updateProjectTask(task.id, task)
        }
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async detectSchedulingConflicts(projectId: string): Promise<SchedulingConflict[]> {
    try {
      const conflicts: NewSchedulingConflict[] = []

      // Get project tasks
      const tasks = await this.getProjectTasks({ projectId })
      if (!tasks || tasks.length === 0) return []

      // Get all dependencies
      const { data: dependencies, error: depError } = await supabase
        .from("task_dependencies")
        .select("*")
        .eq("project_id", projectId)

      if (depError) throw depError

      // Get all resource assignments
      const { data: assignments, error: assignError } = await supabase
        .from("resource_assignments")
        .select("*")
        .eq("project_id", projectId)

      if (assignError) throw assignError

      // Get all constraints
      const { data: constraints, error: constError } = await supabase
        .from("scheduling_constraints")
        .select("*")
        .eq("project_id", projectId)

      if (constError) throw constError

      // 1. Check for dependency violations
      if (dependencies) {
        for (const dep of dependencies) {
          const predecessor = tasks.find((t) => t.id === dep.predecessor_task_id)
          const successor = tasks.find((t) => t.id === dep.successor_task_id)

          if (!predecessor || !successor || !predecessor.scheduled_end || !successor.scheduled_start) continue

          const predEnd = new Date(predecessor.scheduled_end)
          const succStart = new Date(successor.scheduled_start)

          if (dep.dependency_type === "finish_to_start" && predEnd > succStart) {
            conflicts.push({
              project_id: projectId,
              conflict_type: "dependency_violation",
              description: `Task "${successor.name}" starts before its predecessor "${predecessor.name}" finishes`,
              affected_tasks: [predecessor.id, successor.id],
              affected_resources: [],
              resolution_status: "unresolved",
            })
          }
          // Check other dependency types similarly
        }
      }

      // 2. Check for resource overallocation
      if (assignments) {
        const resourceBookings: Record<string, { taskId: string; start: Date; end: Date }[]> = {}

        // Group assignments by resource
        assignments.forEach((assign) => {
          if (!resourceBookings[assign.resource_id]) {
            resourceBookings[assign.resource_id] = []
          }

          resourceBookings[assign.resource_id].push({
            taskId: assign.task_id,
            start: new Date(assign.assignment_start),
            end: new Date(assign.assignment_end),
          })
        })

        // Check for overlaps
        Object.entries(resourceBookings).forEach(([resourceId, bookings]) => {
          // Sort bookings by start time
          bookings.sort((a, b) => a.start.getTime() - b.start.getTime())

          for (let i = 0; i < bookings.length - 1; i++) {
            for (let j = i + 1; j < bookings.length; j++) {
              // Check if bookings overlap
              if (bookings[i].end > bookings[j].start) {
                const task1 = tasks.find((t) => t.id === bookings[i].taskId)
                const task2 = tasks.find((t) => t.id === bookings[j].taskId)

                if (!task1 || !task2) continue

                conflicts.push({
                  project_id: projectId,
                  conflict_type: "resource_overallocation",
                  description: `Resource is assigned to overlapping tasks: "${task1.name}" and "${task2.name}"`,
                  affected_tasks: [task1.id, task2.id],
                  affected_resources: [resourceId],
                  resolution_status: "unresolved",
                })
              }
            }
          }
        })
      }

      // 3. Check for constraint violations
      if (constraints) {
        for (const constraint of constraints) {
          const task = tasks.find((t) => t.id === constraint.task_id)
          if (!task || !task.scheduled_start || !task.scheduled_end) continue

          const constraintDate = new Date(constraint.constraint_date)
          const taskStart = new Date(task.scheduled_start)
          const taskEnd = new Date(task.scheduled_end)

          let violated = false
          let description = ""

          switch (constraint.constraint_type) {
            case "must_start_on":
              if (taskStart.toDateString() !== constraintDate.toDateString()) {
                violated = true
                description = `Task "${task.name}" must start on ${constraintDate.toLocaleDateString()} but is scheduled for ${taskStart.toLocaleDateString()}`
              }
              break
            case "must_finish_by":
              if (taskEnd > constraintDate) {
                violated = true
                description = `Task "${task.name}" must finish by ${constraintDate.toLocaleDateString()} but is scheduled to end on ${taskEnd.toLocaleDateString()}`
              }
              break
            case "not_earlier_than":
              if (taskStart < constraintDate) {
                violated = true
                description = `Task "${task.name}" cannot start before ${constraintDate.toLocaleDateString()} but is scheduled for ${taskStart.toLocaleDateString()}`
              }
              break
            case "not_later_than":
              if (taskStart > constraintDate) {
                violated = true
                description = `Task "${task.name}" cannot start after ${constraintDate.toLocaleDateString()} but is scheduled for ${taskStart.toLocaleDateString()}`
              }
              break
          }

          if (violated) {
            conflicts.push({
              project_id: projectId,
              conflict_type: "constraint_violation",
              description,
              affected_tasks: [task.id],
              affected_resources: [],
              resolution_status: "unresolved",
            })
          }
        }
      }

      // Insert conflicts into database
      if (conflicts.length > 0) {
        const { data, error } = await supabase.from("scheduling_conflicts").insert(conflicts).select()
        if (error) throw error
        return data
      }

      return []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async analyzeSchedule(projectId: string): Promise<ScheduleAnalysisResult> {
    try {
      // Get project tasks with dependencies
      const tasks = await this.getProjectTasks({ projectId })
      if (!tasks || tasks.length === 0) {
        throw new Error("No tasks found for this project")
      }

      // Get resources with assignments
      const resources = await this.getResources()

      // Get conflicts
      const conflicts = await this.getSchedulingConflicts(projectId)

      // 1. Calculate critical path
      const criticalPath = this.calculateCriticalPath(tasks)

      // 2. Identify bottleneck resources
      const bottleneckResources = this.identifyBottleneckResources(tasks, resources)

      // 3. Assess delay risks
      const delayRisks = this.assessDelayRisks(tasks, conflicts)

      // 4. Calculate resource utilization
      const resourceUtilization = this.calculateResourceUtilization(tasks, resources)

      // 5. Identify weather impacts
      const weatherImpacts = await this.identifyWeatherImpacts(projectId, tasks)

      return {
        criticalPath,
        bottleneckResources,
        delayRisks,
        resourceUtilization,
        weatherImpacts,
        conflicts,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper methods for schedule analysis
  calculateCriticalPath(tasks: ProjectTaskWithDetails[]): ProjectTaskWithDetails[] {
    // Build dependency graph
    const graph: Record<string, string[]> = {}
    tasks.forEach((task) => {
      graph[task.id] = []
    })

    tasks.forEach((task) => {
      if (task.dependencies) {
        task.dependencies.forEach((dep) => {
          graph[dep.successor_task_id].push(dep.predecessor_task_id)
        })
      }
    })

    // Calculate earliest start and finish times
    const earliestStart: Record<string, number> = {}
    const earliestFinish: Record<string, number> = {}

    // Topological sort
    const visited: Record<string, boolean> = {}
    const sorted: string[] = []

    function visit(taskId: string) {
      if (visited[taskId]) return
      visited[taskId] = true

      graph[taskId].forEach((depId) => {
        visit(depId)
      })

      sorted.unshift(taskId)
    }

    tasks.forEach((task) => {
      if (!visited[task.id]) {
        visit(task.id)
      }
    })

    // Calculate earliest times
    sorted.forEach((taskId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (!task) return

      const duration = task.estimated_duration || 0
      const predecessors = graph[taskId]

      if (predecessors.length === 0) {
        earliestStart[taskId] = 0
        earliestFinish[taskId] = duration
      } else {
        earliestStart[taskId] = Math.max(...predecessors.map((predId) => earliestFinish[predId] || 0))
        earliestFinish[taskId] = earliestStart[taskId] + duration
      }
    })

    // Calculate latest start and finish times
    const latestStart: Record<string, number> = {}
    const latestFinish: Record<string, number> = {}

    // Find project end time
    const projectEndTime = Math.max(...Object.values(earliestFinish))

    // Calculate latest times in reverse order
    sorted
      .slice()
      .reverse()
      .forEach((taskId) => {
        const task = tasks.find((t) => t.id === taskId)
        if (!task) return

        const duration = task.estimated_duration || 0
        const successors = tasks
          .filter((t) => t.dependencies?.some((dep) => dep.predecessor_task_id === taskId))
          .map((t) => t.id)

        if (successors.length === 0) {
          latestFinish[taskId] = projectEndTime
          latestStart[taskId] = latestFinish[taskId] - duration
        } else {
          latestFinish[taskId] = Math.min(...successors.map((succId) => latestStart[succId] || projectEndTime))
          latestStart[taskId] = latestFinish[taskId] - duration
        }
      })

    // Identify critical path (tasks with zero slack)
    const criticalPathTaskIds = tasks
      .filter((task) => {
        const slack = (latestStart[task.id] || 0) - (earliestStart[task.id] || 0)
        return slack === 0
      })
      .map((task) => task.id)

    return tasks.filter((task) => criticalPathTaskIds.includes(task.id))
  },

  identifyBottleneckResources(tasks: ProjectTaskWithDetails[], resources: ResourceWithAssignments[]): Resource[] {
    // Count assignments per resource
    const resourceAssignmentCount: Record<string, number> = {}
    const resourceUtilization: Record<string, number> = {}

    tasks.forEach((task) => {
      if (task.resourceAssignments) {
        task.resourceAssignments.forEach((assign) => {
          if (!resourceAssignmentCount[assign.resource_id]) {
            resourceAssignmentCount[assign.resource_id] = 0
          }
          resourceAssignmentCount[assign.resource_id]++

          // Calculate utilization (percentage of project duration)
          if (!resourceUtilization[assign.resource_id]) {
            resourceUtilization[assign.resource_id] = 0
          }

          if (assign.assignment_start && assign.assignment_end) {
            const duration = new Date(assign.assignment_end).getTime() - new Date(assign.assignment_start).getTime()
            resourceUtilization[assign.resource_id] += duration
          }
        })
      }
    })

    // Find project duration
    let projectStart = new Date()
    let projectEnd = new Date()

    tasks.forEach((task) => {
      if (task.scheduled_start && new Date(task.scheduled_start) < projectStart) {
        projectStart = new Date(task.scheduled_start)
      }
      if (task.scheduled_end && new Date(task.scheduled_end) > projectEnd) {
        projectEnd = new Date(task.scheduled_end)
      }
    })

    const projectDuration = projectEnd.getTime() - projectStart.getTime()

    // Convert utilization to percentage
    Object.keys(resourceUtilization).forEach((resourceId) => {
      resourceUtilization[resourceId] = (resourceUtilization[resourceId] / projectDuration) * 100
    })

    // Identify bottlenecks (resources with high assignment count and utilization)
    const bottleneckThreshold = 80 // 80% utilization
    const bottleneckResourceIds = Object.keys(resourceUtilization).filter(
      (resourceId) => resourceUtilization[resourceId] > bottleneckThreshold,
    )

    return resources.filter((resource) => bottleneckResourceIds.includes(resource.id))
  },

  assessDelayRisks(
    tasks: ProjectTaskWithDetails[],
    conflicts: SchedulingConflict[],
  ): {
    task: ProjectTaskWithDetails
    riskFactor: number
    reasons: string[]
  }[] {
    const delayRisks: {
      task: ProjectTaskWithDetails
      riskFactor: number
      reasons: string[]
    }[] = []

    tasks.forEach((task) => {
      const reasons: string[] = []
      let riskFactor = 0

      // Check if task is on critical path
      const isCritical = task.is_milestone || false // This would be determined by critical path calculation
      if (isCritical) {
        reasons.push("Task is on the critical path")
        riskFactor += 30
      }

      // Check for conflicts involving this task
      const taskConflicts = conflicts.filter((conflict) => conflict.affected_tasks?.includes(task.id))
      if (taskConflicts.length > 0) {
        reasons.push(`Task has ${taskConflicts.length} scheduling conflicts`)
        riskFactor += taskConflicts.length * 10
      }

      // Check for resource assignments
      if (!task.resourceAssignments || task.resourceAssignments.length === 0) {
        reasons.push("Task has no assigned resources")
        riskFactor += 20
      }

      // Check for dependencies
      if (task.dependencies && task.dependencies.length > 3) {
        reasons.push(`Task has ${task.dependencies.length} dependencies`)
        riskFactor += task.dependencies.length * 5
      }

      // Check for tight deadlines
      if (task.scheduled_start && task.scheduled_end) {
        const duration = new Date(task.scheduled_end).getTime() - new Date(task.scheduled_start).getTime()
        const durationDays = duration / (1000 * 60 * 60 * 24)
        const estimatedDurationDays = (task.estimated_duration || 0) / (8 * 60) // Convert minutes to days

        if (durationDays < estimatedDurationDays) {
          reasons.push("Scheduled duration is less than estimated duration")
          riskFactor += 25
        }
      }

      // Add to delay risks if risk factor is significant
      if (riskFactor > 20) {
        delayRisks.push({
          task,
          riskFactor: Math.min(riskFactor, 100), // Cap at 100%
          reasons,
        })
      }
    })

    // Sort by risk factor (highest first)
    return delayRisks.sort((a, b) => b.riskFactor - a.riskFactor)
  },

  calculateResourceUtilization(
    tasks: ProjectTaskWithDetails[],
    resources: ResourceWithAssignments[],
  ): {
    resource: Resource
    utilizationPercentage: number
  }[] {
    // Calculate project duration
    let projectStart = new Date()
    let projectEnd = new Date()

    tasks.forEach((task) => {
      if (task.scheduled_start && new Date(task.scheduled_start) < projectStart) {
        projectStart = new Date(task.scheduled_start)
      }
      if (task.scheduled_end && new Date(task.scheduled_end) > projectEnd) {
        projectEnd = new Date(task.scheduled_end)
      }
    })

    const projectDuration = projectEnd.getTime() - projectStart.getTime()
    const workingHoursPerDay = 8 // Assuming 8-hour workdays

    // Calculate utilization for each resource
    const utilization: {
      resource: Resource
      utilizationPercentage: number
    }[] = []

    resources.forEach((resource) => {
      let assignedDuration = 0

      // Find all assignments for this resource
      tasks.forEach((task) => {
        if (task.resourceAssignments) {
          const resourceAssignments = task.resourceAssignments.filter((assign) => assign.resource_id === resource.id)

          resourceAssignments.forEach((assign) => {
            if (assign.assignment_start && assign.assignment_end) {
              const start = new Date(assign.assignment_start)
              const end = new Date(assign.assignment_end)
              const duration = end.getTime() - start.getTime()

              // Adjust for allocation percentage
              assignedDuration += (duration * (assign.allocation_percentage || 100)) / 100
            }
          })
        }
      })

      // Calculate utilization percentage
      const availableTime = projectDuration * (workingHoursPerDay / 24) // Adjust for working hours
      const utilizationPercentage = (assignedDuration / availableTime) * 100

      utilization.push({
        resource,
        utilizationPercentage: Math.min(utilizationPercentage, 100), // Cap at 100%
      })
    })

    // Sort by utilization (highest first)
    return utilization.sort((a, b) => b.utilizationPercentage - a.utilizationPercentage)
  },

  async identifyWeatherImpacts(
    projectId: string,
    tasks: ProjectTaskWithDetails[],
  ): Promise<
    {
      date: string
      affectedTasks: ProjectTaskWithDetails[]
      impact: string
    }[]
  > {
    try {
      // Get project details for location
      const project = await projectService.getProjectById(projectId)
      if (!project) {
        throw new Error("Project not found")
      }

      // Get weather impact rules
      const { data: rules, error: rulesError } = await supabase.from("weather_impact_rules").select("*")
      if (rulesError) throw rulesError

      // Get weather data for project location and date range
      const projectLocation = project.project_city || "Unknown"
      const startDate = new Date(
        Math.min(...tasks.map((t) => (t.scheduled_start ? new Date(t.scheduled_start).getTime() : Date.now()))),
      )
      const endDate = new Date(
        Math.max(...tasks.map((t) => (t.scheduled_end ? new Date(t.scheduled_end).getTime() : Date.now()))),
      )

      // Fetch weather data
      const weatherData = await weatherService.getWeatherForecast(projectLocation ?? "Unknown", startDate, endDate)

      // Identify impacts
      const impacts: {
        date: string
        affectedTasks: ProjectTaskWithDetails[]
        impact: string
      }[] = []

      weatherData.forEach((weather) => {
        const impactedTasks: ProjectTaskWithDetails[] = []
        let impactDescription = ""

        // Check for severe weather conditions
        if (
          (weather.condition === "rain" && weather.precipitation > 0.5) ||
          weather.condition === "snow" ||
          weather.windSpeed > 20
        ) {
          // Find tasks scheduled on this date
          const date = new Date(weather.date)
          const tasksOnDate = tasks.filter((task) => {
            if (!task.scheduled_start || !task.scheduled_end) return false
            const start = new Date(task.scheduled_start)
            const end = new Date(task.scheduled_end)
            return date >= start && date <= end
          })

          // Check which tasks would be affected based on rules
          tasksOnDate.forEach((task) => {
            if (!task.task_template_id) return

            const taskRules = rules?.filter((rule) => rule.task_template_id === task.task_template_id) || []
            if (taskRules.length === 0) return

            for (const rule of taskRules) {
              let impactTriggered = false

              // Check weather condition
              if (rule.weather_condition && rule.weather_condition === weather.condition) {
                impactTriggered = true
              }

              // Check precipitation
              if (rule.precipitation_threshold !== null && weather.precipitation > rule.precipitation_threshold) {
                impactTriggered = true
              }

              // Check wind
              if (rule.wind_threshold !== null && weather.windSpeed > rule.wind_threshold) {
                impactTriggered = true
              }

              if (impactTriggered) {
                impactedTasks.push(task)

                switch (rule.impact_type) {
                  case "delay":
                    impactDescription = `${weather.condition} weather may cause delays`
                    break
                  case "cancel":
                    impactDescription = `${weather.condition} weather may require rescheduling`
                    break
                  case "reduce_productivity":
                    impactDescription = `${weather.condition} weather may reduce productivity by ${rule.impact_value}%`
                    break
                }

                break // Once we've found an impact, no need to check other rules
              }
            }
          })

          if (impactedTasks.length > 0) {
            impacts.push({
              date: weather.date,
              affectedTasks: impactedTasks,
              impact: impactDescription,
            })
          }
        }
      })

      return impacts
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
