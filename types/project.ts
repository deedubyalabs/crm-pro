import type { Database } from "./supabase"

export type Project = Database["public"]["Tables"]["projects"]["Row"]
export type NewProject = Database["public"]["Tables"]["projects"]["Insert"]
export type UpdateProject = Database["public"]["Tables"]["projects"]["Update"]

export type ProjectWithCustomer = Project & {
  customer: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  } | null
}

export type ProjectFilters = {
  status?: string
  customerId?: string
  search?: string
}
