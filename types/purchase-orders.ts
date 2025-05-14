import type { Database } from "./supabase"
import type { MaterialListItem } from "./material-lists"
import type { Supplier } from "./suppliers"
import type { Project } from "./projects"

export type PurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Row"]
export type NewPurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Insert"]
export type UpdatePurchaseOrder = Database["public"]["Tables"]["purchase_orders"]["Update"]

export type PurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Row"]
export type NewPurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Insert"]
export type UpdatePurchaseOrderItem = Database["public"]["Tables"]["purchase_order_items"]["Update"]

export type DeliverySchedule = Database["public"]["Tables"]["delivery_schedules"]["Row"]
export type NewDeliverySchedule = Database["public"]["Tables"]["delivery_schedules"]["Insert"]
export type UpdateDeliverySchedule = Database["public"]["Tables"]["delivery_schedules"]["Update"]

export type PurchaseOrderStatus = "draft" | "issued" | "confirmed" | "partial" | "complete" | "cancelled"
export type DeliveryStatus = "scheduled" | "in_transit" | "delivered" | "delayed" | "cancelled"

export interface PurchaseOrderWithDetails extends PurchaseOrder {
  items: (PurchaseOrderItem & {
    materialListItem?: MaterialListItem | null
  })[]
  supplier: Supplier
  project: Project
  deliveries: DeliverySchedule[]
}

export interface PurchaseOrderFilters {
  projectId?: string
  supplierId?: string
  status?: PurchaseOrderStatus
  search?: string
  startDate?: string
  endDate?: string
}
