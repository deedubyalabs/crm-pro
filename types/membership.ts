import type { Database } from "./supabase"
import type { Customer } from "./customers"

export type MembershipProgram = Database["public"]["Tables"]["membership_programs"]["Row"]
export type NewMembershipProgram = Database["public"]["Tables"]["membership_programs"]["Insert"]
export type UpdateMembershipProgram = Database["public"]["Tables"]["membership_programs"]["Update"]

export type MembershipTier = Database["public"]["Tables"]["membership_tiers"]["Row"]
export type NewMembershipTier = Database["public"]["Tables"]["membership_tiers"]["Insert"]
export type UpdateMembershipTier = Database["public"]["Tables"]["membership_tiers"]["Update"]

export type MembershipIncludedService = Database["public"]["Tables"]["membership_included_services"]["Row"]
export type NewMembershipIncludedService = Database["public"]["Tables"]["membership_included_services"]["Insert"]
export type UpdateMembershipIncludedService = Database["public"]["Tables"]["membership_included_services"]["Update"]

export type CustomerMembership = Database["public"]["Tables"]["customer_memberships"]["Row"]
export type NewCustomerMembership = Database["public"]["Tables"]["customer_memberships"]["Insert"]
export type UpdateCustomerMembership = Database["public"]["Tables"]["customer_memberships"]["Update"]

export type MembershipServiceHistory = Database["public"]["Tables"]["membership_service_history"]["Row"]
export type NewMembershipServiceHistory = Database["public"]["Tables"]["membership_service_history"]["Insert"]
export type UpdateMembershipServiceHistory = Database["public"]["Tables"]["membership_service_history"]["Update"]

export type MembershipStatus = "active" | "pending" | "expired" | "cancelled"
export type PaymentFrequency = "monthly" | "quarterly" | "annually"
export type ServiceFrequency = "monthly" | "quarterly" | "annually" | "twice-yearly" | "custom"
export type ServiceStatus = "scheduled" | "completed" | "cancelled" | "rescheduled"

export interface MembershipBenefit {
  type: "discount" | "priority" | "free_service" | "custom"
  description: string
  value?: number | string
  details?: Record<string, any>
}

export interface MembershipTierWithDetails extends MembershipTier {
  includedServices?: MembershipIncludedService[]
  benefits?: MembershipBenefit[]
}

export interface CustomerMembershipWithDetails extends CustomerMembership {
  customer?: Customer
  tier?: MembershipTierWithDetails
  serviceHistory?: MembershipServiceHistory[]
}
