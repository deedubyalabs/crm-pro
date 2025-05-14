import { createClient } from "@/lib/supabase"
import { hash, compare } from "bcrypt"
import { v4 as uuidv4 } from "uuid"
import type {
  ClientPortalUser,
  NewClientPortalUser,
  ClientPortalInvitation,
  NewClientPortalInvitation,
  ClientPortalNotification,
  NewClientPortalNotification,
  ClientPortalActivity,
  ClientPortalSettings,
  UpdateClientPortalSettings,
  ClientPortalUserWithDetails,
  ClientDashboardData,
  ActivityType,
} from "@/types/client-portal"

// User management
export async function createClientPortalUser(
  userData: Omit<NewClientPortalUser, "password_hash"> & { password: string },
): Promise<ClientPortalUser> {
  const supabase = createClient()

  // Hash the password
  const passwordHash = await hash(userData.password, 10)

  // Create the user
  const { data, error } = await supabase
    .from("client_portal_users")
    .insert({
      ...userData,
      password_hash: passwordHash,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function authenticateClientPortalUser(
  email: string,
  password: string,
): Promise<{ user: ClientPortalUser; token: string } | null> {
  const supabase = createClient()

  // Find the user
  const { data: user, error } = await supabase
    .from("client_portal_users")
    .select("*")
    .eq("email", email.toLowerCase())
    .eq("is_active", true)
    .single()

  if (error || !user) return null

  // Verify password
  const passwordValid = await compare(password, user.password_hash)
  if (!passwordValid) return null

  // Create a session
  const token = uuidv4()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  await supabase.from("client_portal_sessions").insert({
    user_id: user.id,
    token,
    expires_at: expiresAt.toISOString(),
    created_at: new Date().toISOString(),
  })

  // Update last login
  await supabase
    .from("client_portal_users")
    .update({
      last_login_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  // Log activity
  await logClientActivity(user.id, "login", {})

  return { user, token }
}

export async function validateClientPortalSession(token: string): Promise<ClientPortalUserWithDetails | null> {
  const supabase = createClient()

  // Find the session
  const { data: session, error } = await supabase
    .from("client_portal_sessions")
    .select("*")
    .eq("token", token)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !session) return null

  // Get the user with details
  const { data: user, error: userError } = await supabase
    .from("client_portal_users")
    .select(`
      *,
      customer:customers(
        id,
        name,
        email,
        phone
      )
    `)
    .eq("id", session.user_id)
    .eq("is_active", true)
    .single()

  if (userError || !user) return null

  // Get projects associated with this customer
  const { data: customerProjects, error: projectsError } = await supabase
    .from("customer_projects")
    .select(`
      project:projects(
        id,
        project_name
      )
    `)
    .eq("customer_id", user.customer_id)

  if (projectsError) return null

  // Get unread notification count
  const { count: unreadCount, error: notifError } = await supabase
    .from("client_portal_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (notifError) return null

  return {
    ...user,
    projects: customerProjects.map((cp) => ({
      id: cp.project.id,
      name: cp.project.project_name,
    })),
    unreadNotifications: unreadCount || 0,
  }
}

export async function logoutClientPortalUser(token: string): Promise<void> {
  const supabase = createClient()

  await supabase.from("client_portal_sessions").delete().eq("token", token)
}

// Invitations
export async function createClientInvitation(invitation: NewClientPortalInvitation): Promise<ClientPortalInvitation> {
  const supabase = createClient()

  // Generate a unique token
  const token = uuidv4()

  // Set expiration (7 days from now)
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  const { data, error } = await supabase
    .from("client_portal_invitations")
    .insert({
      ...invitation,
      token,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function validateInvitation(token: string): Promise<ClientPortalInvitation | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_invitations")
    .select("*")
    .eq("token", token)
    .is("accepted_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !data) return null

  return data
}

export async function markInvitationAccepted(token: string): Promise<void> {
  const supabase = createClient()

  await supabase.from("client_portal_invitations").update({ accepted_at: new Date().toISOString() }).eq("token", token)
}

// Notifications
export async function createNotification(notification: NewClientPortalNotification): Promise<ClientPortalNotification> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_notifications")
    .insert({
      ...notification,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getNotifications(userId: string, limit = 20, offset = 0): Promise<ClientPortalNotification[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return data || []
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = createClient()

  await supabase.from("client_portal_notifications").update({ is_read: true }).eq("id", notificationId)
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  const supabase = createClient()

  await supabase
    .from("client_portal_notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false)
}

// Activity logging
export async function logClientActivity(
  userId: string,
  type: ActivityType,
  details: Record<string, any>,
  ipAddress?: string,
): Promise<ClientPortalActivity> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_activities")
    .insert({
      user_id: userId,
      type,
      details,
      created_at: new Date().toISOString(),
      ip_address: ipAddress,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function getClientActivities(userId: string, limit = 50, offset = 0): Promise<ClientPortalActivity[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_activities")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return data || []
}

// Portal settings
export async function getPortalSettings(): Promise<ClientPortalSettings | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("client_portal_settings").select("*").single()

  if (error) {
    if (error.code === "PGRST116") return null // Record not found
    throw error
  }

  return data
}

export async function updatePortalSettings(settings: UpdateClientPortalSettings): Promise<ClientPortalSettings> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("client_portal_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", settings.id)
    .select()
    .single()

  if (error) throw error

  return data
}

// Dashboard data
export async function getClientDashboardData(userId: string, customerId: string): Promise<ClientDashboardData> {
  const supabase = createClient()

  // Get projects
  const { data: customerProjects, error: projectsError } = await supabase
    .from("customer_projects")
    .select(`
      project:projects(*)
    `)
    .eq("customer_id", customerId)

  if (projectsError) throw projectsError

  const projects = customerProjects.map((cp) => cp.project)
  const projectIds = projects.map((p) => p.id)

  // Get invoices
  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("*")
    .in("project_id", projectIds)
    .order("due_date", { ascending: false })

  if (invoicesError) throw invoicesError

  // Get estimates
  const { data: estimates, error: estimatesError } = await supabase
    .from("estimates")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  if (estimatesError) throw estimatesError

  // Get change orders
  const { data: changeOrders, error: changeOrdersError } = await supabase
    .from("change_orders")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  if (changeOrdersError) throw changeOrdersError

  // Get documents
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false })

  if (documentsError) throw documentsError

  // Get notifications
  const { data: notifications, error: notificationsError } = await supabase
    .from("client_portal_notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10)

  if (notificationsError) throw notificationsError

  // Calculate summary data
  const paidInvoices = invoices.filter((i) => i.status === "paid")
  const overdueInvoices = invoices.filter((i) => i.status !== "paid" && i.due_date && new Date(i.due_date) < new Date())
  const upcomingInvoices = invoices.filter(
    (i) => i.status !== "paid" && i.due_date && new Date(i.due_date) >= new Date(),
  )

  const approvedEstimates = estimates.filter((e) => e.status === "approved")
  const pendingEstimates = estimates.filter((e) => e.status === "pending")

  const approvedChangeOrders = changeOrders.filter((co) => co.status === "approved")
  const pendingChangeOrders = changeOrders.filter((co) => co.status === "pending")

  const documentsNeedingSignature = documents.filter((d) => d.status === "pending_signature")

  return {
    projects,
    invoices: {
      total: invoices.length,
      paid: paidInvoices.length,
      overdue: overdueInvoices.length,
      upcoming: upcomingInvoices.length,
      recent: invoices.slice(0, 5),
    },
    estimates: {
      total: estimates.length,
      approved: approvedEstimates.length,
      pending: pendingEstimates.length,
      recent: estimates.slice(0, 5),
    },
    changeOrders: {
      total: changeOrders.length,
      approved: approvedChangeOrders.length,
      pending: pendingChangeOrders.length,
      recent: changeOrders.slice(0, 5),
    },
    documents: {
      total: documents.length,
      needsSignature: documentsNeedingSignature.length,
      recent: documents.slice(0, 5),
    },
    notifications: notifications || [],
  }
}
