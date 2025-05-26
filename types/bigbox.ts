export interface BigBoxOffer {
  price: number
  regular_price?: number
  symbol: string
  currency: string
}

export interface BigBoxFulfillmentInfo {
  store_id?: string
  store_state?: string
  store_name?: string
  stock_level?: number
  in_stock: boolean
}

export interface BigBoxFulfillment {
  pickup: boolean
  ship_to_store: boolean
  ship_to_home: boolean
  scheduled_delivery: boolean
  pickup_info?: BigBoxFulfillmentInfo
  ship_to_store_info?: BigBoxFulfillmentInfo
  ship_to_home_info?: BigBoxFulfillmentInfo
  scheduled_delivery_info?: BigBoxFulfillmentInfo
}

export interface BigBoxProduct {
  title: string // Changed from 'name' to 'title' to match API
  link: string
  is_bestseller?: boolean
  is_exclusive?: boolean
  is_top_rated?: boolean
  sponsored?: boolean
  brand: string
  item_id: string
  store_sku: string
  model_number: string
  images: string[]
  primary_image: string
  rating: number
  ratings_total: number
  collection?: {
    id: string
    name: string
    link: string
  }
  features: {
    name: string
    value: string
  }[]
  offers?: {
    primary: BigBoxOffer
  }
  price?: number | null // Added to handle price at top level for getProductById
}

export interface BigBoxSearchResultItem {
  position: number
  product: BigBoxProduct
  fulfillment: BigBoxFulfillment
  offers: {
    primary: BigBoxOffer
  }
}

export interface BigBoxSearchResult {
  request_info: {
    success: boolean
    credits_used: number
    credits_remaining: number
  }
  request_metadata: {
    created_at: string
    processed_at: string
    total_time_taken: number
    homedepot_url: string
  }
  request_parameters: {
    type: string
    search_term: string
    sort_by: string
  }
  search_results: BigBoxSearchResultItem[]
  breadcrumbs: {
    name: string
    link: string
  }[]
  related_queries: {
    query: string
  }[]
  facets: {
    name: string
    display_name: string
    values: {
      display_name: string
      value: string
      link: string
      count: number
      active: boolean
    }[]
  }[]
  total?: number
  page?: number
  per_page?: number
  total_pages?: number
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
  last_synced_at: string | null // Changed to allow null
  created_at: string
  updated_at: string
}
