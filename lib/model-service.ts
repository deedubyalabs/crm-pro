import apiClient from "./api-client"

export type Model = {
  id: string;
  name: string;
  provider: string;
  model_id: string;
  context_window: number;
  max_tokens: number;
  is_enabled: boolean;
  api_key?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const ModelService = {
  async getModels(): Promise<Model[]> {
    const response = await apiClient.get<Model[]>("/models") // Assuming /models endpoint
    return response.data || []
  },

  async getModel(id: string): Promise<Model | null> {
    const response = await apiClient.get<Model>(`/models/${id}`)
    return response.data
  },

  async createModel(model: Omit<Model, "id" | "created_at" | "updated_at">): Promise<Model | null> {
    const response = await apiClient.post<Model>("/models", model)
    return response.data
  },

  async updateModel(id: string, updates: Partial<Model>): Promise<Model | null> {
    const response = await apiClient.patch<Model>(`/models/${id}`, updates)
    return response.data
  },

  async deleteModel(id: string): Promise<boolean> {
    const response = await apiClient.delete<{ success: boolean }>(`/models/${id}`)
    return response.data?.success || false
  },
}
