import { supabase, handleSupabaseError } from "./supabase"
import type { BigBoxProduct, BigBoxSearchResult, BigBoxProductMapping, BigBoxStore } from "@/types/bigbox"
import type { CostItem } from "@/types/cost-items"

const BIGBOX_API_URL = process.env.NEXT_PUBLIC_BIGBOX_API_URL || "https://api.bigboxapi.com"
const BIGBOX_API_KEY = process.env.BIGBOX_API_KEY || ""

export const bigboxService = {
  async searchProducts(
    query: string,
    storeId?: string,
    category?: string,
    brand?: string,
  ): Promise<BigBoxSearchResult> {
    try {
      const url = new URL(`${BIGBOX_API_URL}/request`)
      url.searchParams.append("api_key", BIGBOX_API_KEY) // Use api_key query parameter
      url.searchParams.append("type", "search")
      url.searchParams.append("search_term", query)

      if (storeId) {
        url.searchParams.append("customer_zipcode", storeId) // Assuming storeId is zipcode based on python example
      }

      if (category) {
        // The documentation doesn't explicitly show category or brand parameters for search.
        // I will keep them commented out for now, as they might be causing issues or are not supported for this endpoint.
        // url.searchParams.append("category", category)
      }

      if (brand) {
        // url.searchParams.append("brand", brand)
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
      })

      if (!response.ok) {
        throw new Error(`BigBox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error searching BigBox products:", error)
      throw new Error("Failed to search BigBox products. Please try again later.")
    }
  },

  async getProductById(productId: string, storeId?: string): Promise<BigBoxProduct> {
    try {
      const url = new URL(`${BIGBOX_API_URL}/request`)
      url.searchParams.append("api_key", BIGBOX_API_KEY) // Use api_key query parameter
      url.searchParams.append("type", "product")
      url.searchParams.append("product_id", productId)
      if (storeId) {
        url.searchParams.append("store_id", storeId)
      }

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
      })

      if (!response.ok) {
        throw new Error(`BigBox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Assuming the product data is directly in the response for type=product
      return data
    } catch (error) {
      console.error("Error getting BigBox product:", error)
      throw new Error("Failed to get BigBox product. Please try again later.")
    }
  },

  async getProductCategories(): Promise<string[]> {
    try {
      const url = new URL(`${BIGBOX_API_URL}/request`)
      url.searchParams.append("api_key", BIGBOX_API_KEY) // Use api_key query parameter
      url.searchParams.append("type", "categories")

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
      })

      if (!response.ok) {
        throw new Error(`BigBox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Assuming categories are in data.categories for type=categories
      return data.categories
    } catch (error) {
      console.error("Error getting product categories:", error)
      throw new Error("Failed to get product categories. Please try again later.")
    }
  },

  async getProductBrands(): Promise<string[]> {
    try {
      const url = new URL(`${BIGBOX_API_URL}/request`)
      url.searchParams.append("api_key", BIGBOX_API_KEY) // Use api_key query parameter
      url.searchParams.append("type", "brands")

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
      })

      if (!response.ok) {
        throw new Error(`BigBox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Assuming brands are in data.brands for type=brands
      return data.brands
    } catch (error) {
      console.error("Error getting product brands:", error)
      throw new Error("Failed to get product brands. Please try again later.")
    }
  },

  async getNearbyStores(zipCode: string, radius = 25): Promise<BigBoxStore[]> {
    try {
      const url = new URL(`${BIGBOX_API_URL}/request`)
      url.searchParams.append("api_key", BIGBOX_API_KEY) // Use api_key query parameter
      url.searchParams.append("type", "stores")
      url.searchParams.append("zip_code", zipCode)
      url.searchParams.append("radius", radius.toString())

      const response = await fetch(url.toString(), {
        headers: {
          "Content-Type": "application/json",
          // Remove Authorization header
        },
      })

      if (!response.ok) {
        throw new Error(`BigBox API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      // Assuming stores are in data.stores for type=stores
      return data.stores
    } catch (error) {
      console.error("Error getting nearby stores:", error)
      throw new Error("Failed to get nearby stores. Please try again later.")
    }
  },

  async createProductMapping(
    costItemId: string,
    bigboxProductId: string,
    storeId: string,
    quantity = 1,
  ): Promise<BigBoxProductMapping> {
    try {
      const { data, error } = await supabase
        .from("bigbox_product_mappings")
        .insert({
          cost_item_id: costItemId,
          bigbox_product_id: bigboxProductId,
          store_id: storeId,
          quantity: quantity,
          last_synced_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      // Update the cost_item to enable syncing
      await supabase
        .from("cost_items")
        .update({
          sync_with_bigbox: true,
          last_price_sync: new Date().toISOString(),
        })
        .eq("id", costItemId)

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateProductMapping(mappingId: string, quantity: number): Promise<BigBoxProductMapping> {
    try {
      const { data, error } = await supabase
        .from("bigbox_product_mappings")
        .update({
          quantity: quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", mappingId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteProductMapping(mappingId: string): Promise<void> {
    try {
      const { data: mapping, error: fetchError } = await supabase
        .from("bigbox_product_mappings")
        .select("cost_item_id")
        .eq("id", mappingId)
        .single()

      if (fetchError) throw fetchError

      const { error: deleteError } = await supabase.from("bigbox_product_mappings").delete().eq("id", mappingId)

      if (deleteError) throw deleteError

      // Check if there are any other mappings for this cost item
      const { data: otherMappings, error: countError } = await supabase
        .from("bigbox_product_mappings")
        .select("id")
        .eq("cost_item_id", mapping.cost_item_id)

      if (countError) throw countError

      // If no other mappings exist, disable syncing for the cost item
      if (otherMappings.length === 0) {
        await supabase
          .from("cost_items")
          .update({
            sync_with_bigbox: false,
          })
          .eq("id", mapping.cost_item_id)
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getMappingsForCostItem(costItemId: string): Promise<BigBoxProductMapping[]> {
    try {
      const { data, error } = await supabase
        .from("bigbox_product_mappings")
        .select("*")
        .eq("cost_item_id", costItemId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async syncCostItemPrice(costItemId: string): Promise<CostItem> {
    try {
      // Get all mappings for this cost item
      const { data: mappings, error: mappingsError } = await supabase
        .from("bigbox_product_mappings")
        .select("*")
        .eq("cost_item_id", costItemId)

      if (mappingsError) throw mappingsError

      if (!mappings || mappings.length === 0) {
        throw new Error("No BigBox product mappings found for this cost item")
      }

      // Fetch the latest price from BigBox for each mapping
      let totalPrice = 0
      let totalQuantity = 0

      for (const mapping of mappings) {
        try {
          const product = await this.getProductById(mapping.bigbox_product_id, mapping.store_id)

          if (product && product.price) {
            const quantity = mapping.quantity || 1
            totalPrice += product.price * quantity
            totalQuantity += quantity
          }
        } catch (error) {
          console.error(`Error fetching price for product ${mapping.bigbox_product_id}:`, error)
          // Continue with other mappings even if one fails
        }
      }

      // Calculate average price if we got any valid prices
      if (totalQuantity === 0) {
        throw new Error("Could not fetch valid prices from BigBox for any mapped products")
      }

      const averagePrice = totalPrice / totalQuantity

      // Update the cost item with the new price
      const { data: updatedCostItem, error: updateError } = await supabase
        .from("cost_items")
        .update({
          unit_cost: averagePrice,
          last_price_sync: new Date().toISOString(),
        })
        .eq("id", costItemId)
        .select()
        .single()

      if (updateError) throw updateError

      // Update the last_synced_at timestamp for all mappings
      await supabase
        .from("bigbox_product_mappings")
        .update({
          last_synced_at: new Date().toISOString(),
        })
        .eq("cost_item_id", costItemId)

      return updatedCostItem
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async syncAllCostItems(): Promise<number> {
    try {
      // Get all cost items that are set to sync with BigBox
      const { data: costItems, error: costItemsError } = await supabase
        .from("cost_items")
        .select("id")
        .eq("sync_with_bigbox", true)
        .eq("is_active", true)

      if (costItemsError) throw costItemsError

      if (!costItems || costItems.length === 0) {
        return 0
      }

      let syncedCount = 0

      // Sync each cost item
      for (const costItem of costItems) {
        try {
          await this.syncCostItemPrice(costItem.id)
          syncedCount++
        } catch (error) {
          console.error(`Error syncing cost item ${costItem.id}:`, error)
          // Continue with other cost items even if one fails
        }
      }

      return syncedCount
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createCostItemFromProduct(product: BigBoxProduct, markup = 20): Promise<CostItem> {
    try {
      // Generate a unique item code
      const itemCode = `BB-${product.sku.substring(0, 8)}`

      // Determine the appropriate unit based on product category or dimensions
      let unit = "EA" // Default unit
      if (product.category.toLowerCase().includes("lumber") || product.category.toLowerCase().includes("trim")) {
        unit = "LF" // Linear feet for lumber
      } else if (
        product.category.toLowerCase().includes("drywall") ||
        product.category.toLowerCase().includes("flooring")
      ) {
        unit = "SQ FT" // Square feet for area materials
      } else if (product.category.toLowerCase().includes("paint") || product.category.toLowerCase().includes("stain")) {
        unit = "GAL" // Gallon for liquids
      }

      // Create the cost item
      const { data, error } = await supabase
        .from("cost_items")
        .insert({
          item_code: itemCode,
          name: product.name,
          description: product.description,
          type: this.mapCategoryToType(product.category),
          unit: unit,
          unit_cost: product.price,
          default_markup: markup,
          is_active: true,
          sync_with_bigbox: true,
          last_price_sync: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  mapCategoryToType(category: string): "Material" | "Labor" | "Equipment" | "Subcontractor" | "Other" {
    const lowerCategory = category.toLowerCase()

    if (lowerCategory.includes("tool") || lowerCategory.includes("equipment") || lowerCategory.includes("machinery")) {
      return "Equipment"
    } else if (lowerCategory.includes("service") || lowerCategory.includes("installation")) {
      return "Labor"
    } else if (lowerCategory.includes("contractor") || lowerCategory.includes("professional")) {
      return "Subcontractor"
    } else if (
      lowerCategory.includes("lumber") ||
      lowerCategory.includes("hardware") ||
      lowerCategory.includes("paint") ||
      lowerCategory.includes("plumbing") ||
      lowerCategory.includes("electrical") ||
      lowerCategory.includes("flooring") ||
      lowerCategory.includes("drywall") ||
      lowerCategory.includes("roofing") ||
      lowerCategory.includes("insulation")
    ) {
      return "Material"
    } else {
      return "Other"
    }
  },

  async bulkCreateCostItems(products: BigBoxProduct[], markup = 20): Promise<CostItem[]> {
    const createdItems: CostItem[] = []

    for (const product of products) {
      try {
        const costItem = await this.createCostItemFromProduct(product, markup)
        createdItems.push(costItem)
      } catch (error) {
        console.error(`Error creating cost item from product ${product.id}:`, error)
        // Continue with other products even if one fails
      }
    }

    return createdItems
  },
}
