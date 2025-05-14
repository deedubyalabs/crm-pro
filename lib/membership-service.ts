import { supabase, handleSupabaseError } from "./supabase"
import type {
  MembershipProgram,
  NewMembershipProgram,
  UpdateMembershipProgram,
  MembershipTier,
  NewMembershipTier,
  UpdateMembershipTier,
  MembershipIncludedService,
  NewMembershipIncludedService,
  UpdateMembershipIncludedService,
  CustomerMembership,
  NewCustomerMembership,
  UpdateCustomerMembership,
  MembershipServiceHistory,
  NewMembershipServiceHistory,
  UpdateMembershipServiceHistory,
  MembershipTierWithDetails,
  CustomerMembershipWithDetails,
} from "@/types/membership"

// Membership Programs
export async function getMembershipPrograms(includeInactive = false): Promise<MembershipProgram[]> {
  try {
    let query = supabase.from("membership_programs").select("*")

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query.order("name")

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function getMembershipProgramById(id: string): Promise<MembershipProgram | null> {
  try {
    const { data, error } = await supabase.from("membership_programs").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createMembershipProgram(program: NewMembershipProgram): Promise<MembershipProgram> {
  try {
    const { data, error } = await supabase
      .from("membership_programs")
      .insert({
        ...program,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateMembershipProgram(
  id: string,
  updates: UpdateMembershipProgram,
): Promise<MembershipProgram> {
  try {
    const { data, error } = await supabase
      .from("membership_programs")
      .update({
        ...updates,
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
}

// Membership Tiers
export async function getMembershipTiers(
  programId?: string,
  includeInactive = false,
): Promise<MembershipTierWithDetails[]> {
  try {
    let query = supabase.from("membership_tiers").select(`
      *,
      includedServices:membership_included_services(*)
    `)

    if (programId) {
      query = query.eq("program_id", programId)
    }

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query.order("monthly_price")

    if (error) throw error

    // Parse benefits JSON
    return (data || []).map((tier) => ({
      ...tier,
      benefits: tier.benefits ? JSON.parse(JSON.stringify(tier.benefits)) : [],
    }))
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function getMembershipTierById(id: string): Promise<MembershipTierWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("membership_tiers")
      .select(`
        *,
        includedServices:membership_included_services(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }

    // Parse benefits JSON
    return {
      ...data,
      benefits: data.benefits ? JSON.parse(JSON.stringify(data.benefits)) : [],
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createMembershipTier(tier: NewMembershipTier): Promise<MembershipTier> {
  try {
    const { data, error } = await supabase
      .from("membership_tiers")
      .insert({
        ...tier,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateMembershipTier(id: string, updates: UpdateMembershipTier): Promise<MembershipTier> {
  try {
    const { data, error } = await supabase
      .from("membership_tiers")
      .update({
        ...updates,
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
}

// Membership Included Services
export async function getIncludedServices(tierId?: string): Promise<MembershipIncludedService[]> {
  try {
    let query = supabase.from("membership_included_services").select("*")

    if (tierId) {
      query = query.eq("tier_id", tierId)
    }

    const { data, error } = await query.order("service_name")

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createIncludedService(service: NewMembershipIncludedService): Promise<MembershipIncludedService> {
  try {
    const { data, error } = await supabase
      .from("membership_included_services")
      .insert({
        ...service,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateIncludedService(
  id: string,
  updates: UpdateMembershipIncludedService,
): Promise<MembershipIncludedService> {
  try {
    const { data, error } = await supabase
      .from("membership_included_services")
      .update({
        ...updates,
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
}

// Customer Memberships
export async function getCustomerMemberships(
  customerId?: string,
  status?: string,
): Promise<CustomerMembershipWithDetails[]> {
  try {
    let query = supabase.from("customer_memberships").select(`
      *,
      customer:customers(*),
      tier:tier_id(
        *,
        includedServices:membership_included_services(*)
      )
    `)

    if (customerId) {
      query = query.eq("customer_id", customerId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("start_date", { ascending: false })

    if (error) throw error

    // Get service history for each membership
    const memberships = data || []
    const membershipIds = memberships.map((m) => m.id)

    if (membershipIds.length > 0) {
      const { data: serviceHistory, error: historyError } = await supabase
        .from("membership_service_history")
        .select("*")
        .in("membership_id", membershipIds)
        .order("scheduled_date", { ascending: false })

      if (historyError) throw historyError

      // Group service history by membership_id
      const historyByMembership: Record<string, MembershipServiceHistory[]> = {}
      serviceHistory.forEach((history) => {
        if (!historyByMembership[history.membership_id]) {
          historyByMembership[history.membership_id] = []
        }
        historyByMembership[history.membership_id].push(history)
      })

      // Add service history to each membership
      return memberships.map((membership) => ({
        ...membership,
        serviceHistory: historyByMembership[membership.id] || [],
        tier: membership.tier
          ? {
              ...membership.tier,
              benefits: membership.tier.benefits ? JSON.parse(JSON.stringify(membership.tier.benefits)) : [],
            }
          : undefined,
      }))
    }

    return memberships.map((membership) => ({
      ...membership,
      serviceHistory: [],
      tier: membership.tier
        ? {
            ...membership.tier,
            benefits: membership.tier.benefits ? JSON.parse(JSON.stringify(membership.tier.benefits)) : [],
          }
        : undefined,
    }))
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function getCustomerMembershipById(id: string): Promise<CustomerMembershipWithDetails | null> {
  try {
    const { data, error } = await supabase
      .from("customer_memberships")
      .select(`
        *,
        customer:customers(*),
        tier:tier_id(
          *,
          includedServices:membership_included_services(*)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null // Record not found
      throw error
    }

    // Get service history
    const { data: serviceHistory, error: historyError } = await supabase
      .from("membership_service_history")
      .select("*")
      .eq("membership_id", id)
      .order("scheduled_date", { ascending: false })

    if (historyError) throw historyError

    return {
      ...data,
      serviceHistory: serviceHistory || [],
      tier: data.tier
        ? {
            ...data.tier,
            benefits: data.tier.benefits ? JSON.parse(JSON.stringify(data.tier.benefits)) : [],
          }
        : undefined,
    }
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createCustomerMembership(membership: NewCustomerMembership): Promise<CustomerMembership> {
  try {
    const { data, error } = await supabase
      .from("customer_memberships")
      .insert({
        ...membership,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateCustomerMembership(
  id: string,
  updates: UpdateCustomerMembership,
): Promise<CustomerMembership> {
  try {
    const { data, error } = await supabase
      .from("customer_memberships")
      .update({
        ...updates,
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
}

export async function cancelMembership(
  id: string,
  cancellationReason: string,
  cancellationDate = new Date(),
): Promise<CustomerMembership> {
  try {
    const { data, error } = await supabase
      .from("customer_memberships")
      .update({
        status: "cancelled",
        cancellation_date: cancellationDate.toISOString().split("T")[0],
        cancellation_reason: cancellationReason,
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
}

export async function renewMembership(id: string, newEndDate: Date): Promise<CustomerMembership> {
  try {
    const { data: membership, error: fetchError } = await supabase
      .from("customer_memberships")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError) throw fetchError

    // Calculate new dates
    const startDate = new Date(membership.end_date)
    startDate.setDate(startDate.getDate() + 1) // Start day after current end date

    const { data, error } = await supabase
      .from("customer_memberships")
      .update({
        status: "active",
        start_date: startDate.toISOString().split("T")[0],
        end_date: newEndDate.toISOString().split("T")[0],
        last_payment_date: new Date().toISOString().split("T")[0],
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
}

// Membership Service History
export async function getServiceHistory(membershipId: string): Promise<MembershipServiceHistory[]> {
  try {
    const { data, error } = await supabase
      .from("membership_service_history")
      .select("*")
      .eq("membership_id", membershipId)
      .order("scheduled_date", { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function createServiceRecord(service: NewMembershipServiceHistory): Promise<MembershipServiceHistory> {
  try {
    const { data, error } = await supabase
      .from("membership_service_history")
      .insert({
        ...service,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    throw new Error(handleSupabaseError(error))
  }
}

export async function updateServiceRecord(
  id: string,
  updates: UpdateMembershipServiceHistory,
): Promise<MembershipServiceHistory> {
  try {
    const { data, error } = await supabase
      .from("membership_service_history")
      .update({
        ...updates,
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
}

export async function completeServiceRecord(
  id: string,
  completedDate: Date,
  notes?: string,
): Promise<MembershipServiceHistory> {
  try {
    const { data, error } = await supabase
      .from("membership_service_history")
      .update({
        status: "completed",
        completed_date: completedDate.toISOString().split("T")[0],
        notes: notes || null,
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
}

export const membershipService = {
  // Programs
  getMembershipPrograms,
  getMembershipProgramById,
  createMembershipProgram,
  updateMembershipProgram,

  // Tiers
  getMembershipTiers,
  getMembershipTierById,
  createMembershipTier,
  updateMembershipTier,

  // Included Services
  getIncludedServices,
  createIncludedService,
  updateIncludedService,

  // Customer Memberships
  getCustomerMemberships,
  getCustomerMembershipById,
  createCustomerMembership,
  updateCustomerMembership,
  cancelMembership,
  renewMembership,

  // Service History
  getServiceHistory,
  createServiceRecord,
  updateServiceRecord,
  completeServiceRecord,
}
