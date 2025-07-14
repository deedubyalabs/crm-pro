import type { EstimateLineItem } from "./estimates";

export type BidRequestStatus = "Draft" | "Sent" | "Open" | "Closed" | "Awarded" | "Canceled";
export type BidStatus = "Pending" | "Submitted" | "Accepted" | "Rejected" | "Withdrawn";

export interface BidPackageLineItem extends EstimateLineItem {
  // This interface will represent an estimate line item included in a bid package.
  // It extends EstimateLineItem, so it already has id, description, quantity, etc.
  // No additional fields are strictly necessary for the bid package context itself,
  // but it helps to explicitly define it for clarity.
}

export interface BidLineItem {
  id: string; // Unique ID for the bid line item
  bid_id: string; // Foreign key to the Bid
  bid_request_line_item_id: string; // Foreign key to the original bid request line item
  description: string; // Description of the line item (from bid request)
  quantity: number; // Quantity (from bid request)
  unit: string; // Unit (from bid request)
  unit_price: number; // The price submitted by the subcontractor for this single unit
  total: number; // Calculated total for this line item (quantity * unit_price)
  notes: string | null; // Any specific notes for this line item from the subcontractor
}

export interface BidRequest {
  id: string;
  estimate_id: string;
  project_id: string | null; // Bid requests can be linked to projects too
  title: string;
  description: string | null; // Added description for the bid request package
  line_items: BidPackageLineItem[]; // The line items included in this bid request
  status: BidRequestStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
  subcontractor_bids?: Bid[]; // Bids submitted by subcontractors for this request
}

export interface NewBidRequest {
  estimate_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  line_items: BidPackageLineItem[];
  status?: BidRequestStatus;
  due_date?: string | null;
}

export interface UpdateBidRequest {
  title?: string;
  description?: string | null;
  line_items?: BidPackageLineItem[];
  status?: BidRequestStatus;
  due_date?: string | null;
}

export interface BidRequestFilters {
  estimateId?: string;
  projectId?: string;
  status?: BidRequestStatus;
  tradeCategory?: string; // Still relevant for filtering bid requests
}

export interface Bid {
  id: string;
  bid_request_id: string;
  subcontractor_id: string; // The ID of the subcontractor who submitted the bid
  amount: number; // This will now be the calculated total of bid_line_items
  status: BidStatus;
  notes: string | null;
  bid_document_url: string | null; // URL to an attached formal proposal
  submitted_at: string;
  created_at: string;
  updated_at: string;
  // Potentially include subcontractor details if needed for display
  subcontractor?: {
    id: string;
    business_name: string | null;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  bid_line_items?: BidLineItem[]; // New: detailed line item bids
}

export interface NewBid {
  bid_request_id: string;
  subcontractor_id: string;
  amount?: number; // Optional, will be calculated from line items
  status?: BidStatus;
  notes?: string | null;
  bid_document_url?: string | null;
  bid_line_items?: BidLineItem[]; // Made optional
}

export interface UpdateBid {
  amount?: number; // Optional, will be calculated from line items
  status?: BidStatus;
  notes?: string | null;
  bid_document_url?: string | null;
  bid_line_items?: BidLineItem[]; // Made optional
}
