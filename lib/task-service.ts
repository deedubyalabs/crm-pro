import apiClient from "./api-client"

export type Task = {
  id: string // Corresponds to agent_runs.id
  session_id: string // Corresponds to agent_runs.session_id
  run_id: string // Corresponds to agent_runs.run_id
  parent_run_id?: string // Corresponds to agent_runs.parent_run_id
  agent_name: string // Corresponds to agent_runs.agent_name
  start_time: string // Corresponds to agent_runs.start_time
  end_time?: string // Corresponds to agent_runs.end_time
  status: "completed" | "failed" | "running" | "queued" | "pending_approval" | string // Corresponds to agent_runs.status
  input?: Record<string, any> // Corresponds to agent_runs.input
  output?: Record<string, any> // Corresponds to agent_runs.output
  error?: string // Corresponds to agent_runs.error
  metadata?: Record<string, any> // Corresponds to agent_runs.metadata
  created_at: string // Corresponds to agent_runs.created_at
}

export const TaskService = {
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>("/agent_runs") // Change endpoint to /agent_runs
    return response.data || []
  },

  // You can add more methods here as needed, e.g., getTask(id), updateTaskStatus(id, status), etc.
}
