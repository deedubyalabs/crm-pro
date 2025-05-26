// This is a client-side wrapper for the HomePro API
// It provides typed methods for interacting with the API endpoints

type ApiResponse<T> = {
  data: T | null
  error: string | null
}

// Base API client with authentication and error handling
class ApiClient {
  private baseUrl: string
  private apiKey: string | null

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1"
    this.apiKey = null
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    return headers
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)

      if (params) {
        Object.keys(params).forEach((key) => {
          url.searchParams.append(key, params[key])
        })
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.message || "API request failed" }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.message || "API request failed" }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }

  async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PATCH",
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.message || "API request failed" }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { data: null, error: errorData.message || "API request failed" }
      }

      const data = await response.json()
      return { data, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }
}

// Create a singleton instance
const apiClient = new ApiClient()

export default apiClient
