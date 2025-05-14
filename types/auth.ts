export type UserRole = "Admin" | "Manager" | "Estimator" | "Technician" | "Office" | "Client"

export interface User {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSession {
  id: string
  user_id: string
  token: string
  expires_at: string
  created_at: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface SignupData {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export interface ResetPasswordData {
  email: string
}

export interface UpdatePasswordData {
  token: string
  password: string
}

export interface UpdateProfileData {
  first_name?: string
  last_name?: string
  email?: string
}
