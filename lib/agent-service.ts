import { ReactNode } from "react"
import apiClient from "./api-client"

// Types
export type Agent = {
  lastActivity: ReactNode
  tasksProcessed: ReactNode
  errorRate: number
  id: string
  name: string
  description: string
  status: "active" | "inactive" | string // Matches database column name
  model: string // Matches database column name
  system_prompt: string // Matches database column name
  user_id: string // Matches database column name
  created_at: string // Matches database column name
  updated_at: string // Matches database column name
}

export type AgentStats = {
  tasksCompleted: number
  tasksFailed: number
  tokenUsage: number
  averageResponseTime: number
}

export type AgentTool = {
  id: string
  name: string
  description: string
  endpoint: string
  status: "enabled" | "disabled"
}

// Agent Service
export const AgentService = {
  // Get all agents
  async getAgents(): Promise<Agent[]> {
    const response = await apiClient.get<Agent[]>("/agents")
    return response.data || []
  },

  // Get a single agent by ID
  async getAgent(id: string): Promise<Agent | null> {
    const response = await apiClient.get<Agent>(`/agents/${id}`)
    return response.data
  },

  // Create a new agent
  async createAgent(
    agent: Omit<Agent, "id" | "created_at" | "updated_at">,
  ): Promise<Agent | null> {
    const response = await apiClient.post<Agent>("/agents", agent)
    return response.data
  },

  // Update an agent
  async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    const response = await apiClient.patch<Agent>(`/agents/${id}`, updates)
    return response.data
  },

  // Delete an agent
  async deleteAgent(id: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/agents/${id}`)
    return response.data?.success || false
  },

  // Get agent statistics
  async getAgentStats(id: string, timeframe: "day" | "week" | "month" = "day"): Promise<AgentStats | null> {
    const response = await apiClient.get<AgentStats>(`/agents/${id}/stats`, { timeframe })
    return response.data
  },

  // Get tools assigned to an agent
  async getAgentTools(id: string): Promise<AgentTool[]> {
    const response = await apiClient.get<AgentTool[]>(`/agents/${id}/tools`)
    return response.data || []
  },

  // Assign a tool to an agent
  async assignToolToAgent(agentId: string, toolId: string): Promise<boolean> {
    const response = await apiClient.post<{ success: boolean }>(`/agents/${agentId}/tools`, { toolId })
    return response.data?.success || false
  },

  // Remove a tool from an agent
  async removeToolFromAgent(agentId: string, toolId: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/agents/${agentId}/tools/${toolId}`)
    return response.data?.success || false
  },

  // Activate an agent
  async activateAgent(id: string): Promise<Agent | null> {
    const response = await apiClient.patch<Agent>(`/agents/${id}/activate`, {})
    return response.data
  },

  // Deactivate an agent
  async deactivateAgent(id: string): Promise<Agent | null> {
    const response = await apiClient.patch<Agent>(`/agents/${id}/deactivate`, {})
    return response.data
  },

  // Generate a new API key for an agent
  async generateApiKey(id: string): Promise<{ apiKey: string } | null> {
    const response = await apiClient.post<{ apiKey: string }>(`/agents/${id}/api-key`, {})
    return response.data
  },

  // Revoke an agent's API key
  async revokeApiKey(id: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/agents/${id}/api-key`)
    return response.data?.success || false
  },
}
