import type { Database } from "./supabase"
import type { CostItem } from "./cost-items"
import type { Supplier } from "./suppliers"

export type MaterialList = Database["public"]["Tables"]["material_lists"]["Row"]
export type NewMaterialList = Database["public"]["Tables"]["material_lists"]["Insert"]
export type UpdateMaterialList = Database["public"]["Tables"]["material_lists"]["Update"]

export type MaterialListItem = Database["public"]["Tables"]["material_list_items"]["Row"]
export type NewMaterialListItem = Database["public"]["Tables"]["material_list_items"]["Insert"]
export type UpdateMaterialListItem = Database["public"]["Tables"]["material_list_items"]["Update"]

export type MaterialListStatus = "draft" | "finalized" | "ordered" | "partial" | "complete" | "cancelled"
export type MaterialListItemStatus = "pending" | "ordered" | "received" | "backordered" | "cancelled"

export interface MaterialListWithDetails extends MaterialList {
  items: (MaterialListItem & {
    costItem?: CostItem | null
    supplier?: Supplier | null
  })[]
  project: {
    id: string
    project_name: string
  }
  estimate?: {
    id: string
    estimate_number: string
  } | null
}

export interface MaterialListFilters {
  projectId?: string
  status?: MaterialListStatus
  search?: string
}

export interface MaterialListItemWithDetails extends MaterialListItem {
  costItem?: CostItem | null
  supplier?: Supplier | null
}

export interface WasteFactor {
  materialType: string
  defaultFactor: number
  description: string
}

export const DEFAULT_WASTE_FACTORS: WasteFactor[] = [
  { materialType: "lumber", defaultFactor: 10, description: "Framing lumber, trim, etc." },
  { materialType: "drywall", defaultFactor: 15, description: "Gypsum wallboard" },
  { materialType: "tile", defaultFactor: 10, description: "Ceramic, porcelain, stone tiles" },
  { materialType: "carpet", defaultFactor: 15, description: "Carpet and padding" },
  { materialType: "paint", defaultFactor: 10, description: "Interior and exterior paint" },
  { materialType: "concrete", defaultFactor: 5, description: "Ready-mix concrete" },
  { materialType: "roofing", defaultFactor: 15, description: "Shingles, underlayment, etc." },
  { materialType: "siding", defaultFactor: 10, description: "Vinyl, fiber cement, wood siding" },
  { materialType: "insulation", defaultFactor: 5, description: "Batt, blown, rigid insulation" },
  { materialType: "flooring", defaultFactor: 10, description: "Hardwood, laminate, vinyl flooring" },
  { materialType: "electrical", defaultFactor: 5, description: "Wire, boxes, fixtures" },
  { materialType: "plumbing", defaultFactor: 5, description: "Pipe, fittings, fixtures" },
  { materialType: "hvac", defaultFactor: 5, description: "Ductwork, equipment" },
  { materialType: "hardware", defaultFactor: 5, description: "Fasteners, hinges, etc." },
  { materialType: "other", defaultFactor: 10, description: "Miscellaneous materials" },
]
