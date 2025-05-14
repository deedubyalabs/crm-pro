import apiClient from "./api-client"

// Types
export type Tool = {
  id: string
  name: string
  description: string
  endpoint: string
  method: "GET" | "POST" | "PATCH" | "DELETE"
  status: "enabled" | "disabled"
  schema: {
    input: Record<string, any>
    output: Record<string, any>
  }
  agentsWithAccess: number
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type ToolUsageStats = {
  totalCalls: number
  successRate: number
  averageResponseTime: number
  usageByAgent: {
    agentId: string
    agentName: string
    callCount: number
  }[]
}

// Tool Service
export const ToolService = {
  // Get all tools
  async getTools(): Promise<Tool[]> {
    const response = await apiClient.get<Tool[]>("/tools")
    return response.data || []
  },

  // Get a single tool by ID
  async getTool(id: string): Promise<Tool | null> {
    const response = await apiClient.get<Tool>(`/tools/${id}`)
    return response.data
  },

  // Enable a tool
  async enableTool(id: string): Promise<Tool | null> {
    const response = await apiClient.patch<Tool>(`/tools/${id}/enable`, {})
    return response.data
  },

  // Disable a tool
  async disableTool(id: string): Promise<Tool | null> {
    const response = await apiClient.patch<Tool>(`/tools/${id}/disable`, {})
    return response.data
  },

  // Get tool usage statistics
  async getToolStats(id: string, timeframe: "day" | "week" | "month" = "day"): Promise<ToolUsageStats | null> {
    const response = await apiClient.get<ToolUsageStats>(`/tools/${id}/stats`, { timeframe })
    return response.data
  },

  // Get agents with access to a tool
  async getToolAgents(id: string): Promise<{ id: string; name: string }[]> {
    const response = await apiClient.get<{ id: string; name: string }[]>(`/tools/${id}/agents`)
    return response.data || []
  },
}
