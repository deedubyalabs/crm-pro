export interface BigBoxProduct {
  offers: any
  id: string
  sku: string
  name: string
  description: string
  brand: string
  category: string
  price: number
  sale_price: number | null
  availability: "in_stock" | "out_of_stock" | "limited"
  store_id: string
  store_name: string
  image_url: string
  url: string
  specifications: Record<string, string>
  dimensions: {
    width: number
    height: number
    depth: number
    weight: number
    unit: string
  }
  updated_at: string
}

export interface BigBoxSearchResult {
  search_results: BigBoxProduct[]
  total: number
  page: number
  per_page: number
  total_pages: number
  // Add other potential properties from the API response if needed,
  // like request_info, request_metadata, request_parameters, etc.
  // For now, just adding search_results to fix the immediate error.
}

export interface BigBoxStore {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
  hours: Record<string, string>
  latitude: number
  longitude: number
}

export interface BigBoxProductMapping {
  id: string
  cost_item_id: string
  bigbox_product_id: string
  store_id: string
  quantity: number
  last_synced_at: string
  created_at: string
  updated_at: string
}
