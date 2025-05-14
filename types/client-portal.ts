import type { Database } from "./supabase"
import type { Project } from "./projects"
import type { Invoice } from "./invoices"
import type { Estimate } from "./estimates"
import type { ChangeOrder } from "./change-orders"
import type { Document } from "./documents"

export type ClientPortalUser = Database["public"]["Tables"]["client_portal_users"]["Row"]
export type NewClientPortalUser = Database["public"]["Tables"]["client_portal_users"]["Insert"]
export type UpdateClientPortalUser = Database["public"]["Tables"]["client_portal_users"]["Update"]

export type ClientPortalSession = Database["public"]["Tables"]["client_portal_sessions"]["Row"]
export type NewClientPortalSession = Database["public"]["Tables"]["client_portal_sessions"]["Insert"]

export type ClientPortalInvitation = Database["public"]["Tables"]["client_portal_invitations"]["Row"]
export type NewClientPortalInvitation = Database["public"]["Tables"]["client_portal_invitations"]["Insert"]
export type UpdateClientPortalInvitation = Database["public"]["Tables"]["client_portal_invitations"]["Update"]

export type ClientPortalNotification = Database["public"]["Tables"]["client_portal_notifications"]["Row"]
export type NewClientPortalNotification = Database["public"]["Tables"]["client_portal_notifications"]["Insert"]
export type UpdateClientPortalNotification = Database["public"]["Tables"]["client_portal_notifications"]["Update"]

export type ClientPortalActivity = Database["public"]["Tables"]["client_portal_activities"]["Row"]
export type NewClientPortalActivity = Database["public"]["Tables"]["client_portal_activities"]["Insert"]

export type ClientPortalSettings = Database["public"]["Tables"]["client_portal_settings"]["Row"]
export type NewClientPortalSettings = Database["public"]["Tables"]["client_portal_settings"]["Insert"]
export type UpdateClientPortalSettings = Database["public"]["Tables"]["client_portal_settings"]["Update"]

export type NotificationType =
  | "new_message"
  | "new_invoice"
  | "new_estimate"
  | "new_change_order"
  | "new_document"
  | "project_update"
  | "payment_received"
  | "document_signed"

export type ActivityType =
  | "login"
  | "view_project"
  | "view_invoice"
  | "view_estimate"
  | "view_change_order"
  | "view_document"
  | "download_document"
  | "make_payment"
  | "sign_document"
  | "send_message"

export interface ClientPortalUserWithDetails extends ClientPortalUser {
  customer?: {
    id: string
    name: string
    email: string
    phone: string
  }
  projects?: {
    id: string
    name: string
  }[]
  unreadNotifications?: number
}

export interface ClientDashboardData {
  projects: Project[]
  invoices: {
    total: number
    paid: number
    overdue: number
    upcoming: number
    recent: Invoice[]
  }
  estimates: {
    total: number
    approved: number
    pending: number
    recent: Estimate[]
  }
  changeOrders: {
    total: number
    approved: number
    pending: number
    recent: ChangeOrder[]
  }
  documents: {
    total: number
    needsSignature: number
    recent: Document[]
  }
  notifications: ClientPortalNotification[]
}
