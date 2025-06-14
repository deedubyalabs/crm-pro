import type { EstimateLineItem } from "./estimates"
import type { ChangeOrderLineItem } from "./change-orders"
import type { Person } from "@/types/people"

export type BidStatus = "draft" | "sent" | "viewed" | "responded" | "awarded" | "declined" | "expired" | "cancelled"

export type BidResponseStatus = "submitted" | "under_review" | "clarification_needed" | "accepted" | "rejected"

export type TradeCategory =
  | "general"
  | "electrical"
  | "plumbing"
  | "hvac"
  | "carpentry"
  | "masonry"
  | "roofing"
  | "flooring"
  | "painting"
  | "landscaping"
  | "concrete"
  | "drywall"
  | "insulation"
  | "windows_doors"
  | "siding"
  | "cleaning"
  | "demolition"
  | "excavation"
  | "other"

export interface BidRequest {
  id: string
  project_id: string
  estimate_id: string | null
  change_order_id: string | null
  title: string
  description: string | null
  trade_category: TradeCategory | null
  status: BidStatus
  due_date: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  sent_at: string | null
  awarded_at: string | null
  awarded_to: string | null
  notes: string | null
}

export interface BidItem {
  id: string
  bid_request_id: string
  estimate_line_item_id: string | null
  change_order_line_item_id: string | null
  description: string
  quantity: number
  unit: string
  estimated_cost: number | null
  estimated_total: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface BidSubcontractor {
  id: string
  bid_request_id: string
  subcontractor_id: string
  status: string
  invited_at: string
  viewed_at: string | null
  responded_at: string | null
  declined_reason: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BidResponse {
  id: string
  bid_request_id: string
  subcontractor_id: string
  total_amount: number
  status: BidResponseStatus
  notes: string | null
  estimated_duration: number | null
  estimated_start_date: string | null
  created_at: string
  updated_at: string
}

export interface BidResponseItem {
  id: string
  bid_response_id: string
  bid_item_id: string
  unit_price: number
  total_price: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BidAttachment {
  id: string
  bid_request_id: string | null
  bid_response_id: string | null
  file_name: string
  file_type: string
  file_size: number
  file_path: string
  uploaded_by: string | null
  created_at: string
  updated_at: string
}

export interface BidRequestWithDetails extends BidRequest {
  items: (BidItem & {
    estimateLineItem?: EstimateLineItem | null
    changeOrderLineItem?: ChangeOrderLineItem | null
  })[]
  subcontractors: (BidSubcontractor & {
    subcontractor: Person
  })[]
  responses: (BidResponse & {
    subcontractor: Person
    items: BidResponseItem[]
  })[]
  attachments: BidAttachment[]
  project: {
    id: string
    project_name: string
  }
  estimate?: {
    id: string
    estimate_number: string
  } | null
  changeOrder?: {
    id: string
  } | null
}

export interface NewBidRequest {
  project_id: string
  estimate_id?: string | null
  change_order_id?: string | null
  title: string
  description?: string | null
  trade_category?: TradeCategory | null
  status?: BidStatus
  due_date?: string | null
  created_by?: string | null
  notes?: string | null
}

export interface NewBidItem {
  bid_request_id: string
  estimate_line_item_id?: string | null
  change_order_line_item_id?: string | null
  description: string
  quantity: number
  unit: string
  estimated_cost?: number | null
  estimated_total?: number | null
  sort_order?: number
}

export interface UpdateBidRequest {
  title?: string
  description?: string | null
  trade_category?: TradeCategory | null
  status?: BidStatus
  due_date?: string | null
  notes?: string | null
  awarded_to?: string | null
  awarded_at?: string | null
}

export interface UpdateBidItem {
  description?: string
  quantity?: number
  unit?: string
  estimated_cost?: number | null
  estimated_total?: number | null
  sort_order?: number
}

export interface BidRequestFilters {
  projectId?: string
  status?: BidStatus | BidStatus[]
  tradeCategory?: TradeCategory
  estimateId?: string
  changeOrderId?: string
  search?: string
  startDate?: string
  endDate?: string
}

export interface BidComparisonResult {
  bidRequestId: string
  estimateId?: string
  changeOrderId?: string
  totalEstimatedCost: number
  lowestBidAmount: number
  highestBidAmount: number
  averageBidAmount: number
  bidCount: number
  marginImpact: number
  marginPercentage: number
  hasOverBudgetItems: boolean
}

export interface BidItemComparisonResult {
  bidItemId: string
  estimateLineItemId?: string
  changeOrderLineItemId?: string
  description: string
  estimatedCost: number
  lowestBidPrice: number
  highestBidPrice: number
  averageBidPrice: number
  bidCount: number
  variance: number
  variancePercentage: number
  isOverBudget: boolean
}

export interface TradeGroupedItems {
  [tradeCategory: string]: {
    items: (EstimateLineItem | ChangeOrderLineItem)[]
    totalEstimatedCost: number
  }
}
