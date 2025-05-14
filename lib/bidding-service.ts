import { supabase, handleSupabaseError } from "./supabase"
import { v4 as uuidv4 } from "uuid"
import type {
  BidRequest,
  BidRequestWithDetails,
  BidItem,
  BidSubcontractor,
  BidResponse,
  NewBidRequest,
  NewBidItem,
  UpdateBidRequest,
  UpdateBidItem,
  BidRequestFilters,
  BidComparisonResult,
  BidItemComparisonResult,
  TradeGroupedItems,
  TradeCategory,
} from "@/types/bidding"
import type { Person } from "@/types/people"

export const biddingService = {
  async getBidRequests(filters?: BidRequestFilters): Promise<BidRequest[]> {
    try {
      let query = supabase
        .from("bid_requests")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          estimate:estimate_id (
            id,
            estimate_number
          ),
          changeOrder:change_order_id (
            id,
            co_number
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId)
      }

      if (filters?.status) {
        if (Array.isArray(filters.status)) {
          query = query.in("status", filters.status)
        } else {
          query = query.eq("status", filters.status)
        }
      }

      if (filters?.tradeCategory) {
        query = query.eq("trade_category", filters.tradeCategory)
      }

      if (filters?.estimateId) {
        query = query.eq("estimate_id", filters.estimateId)
      }

      if (filters?.changeOrderId) {
        query = query.eq("change_order_id", filters.changeOrderId)
      }

      if (filters?.search) {
        query = query.ilike("title", `%${filters.search}%`)
      }

      if (filters?.startDate) {
        query = query.gte("created_at", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("created_at", filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getBidRequestById(id: string): Promise<BidRequestWithDetails | null> {
    try {
      const { data: bidRequest, error } = await supabase
        .from("bid_requests")
        .select(`
          *,
          project:project_id (
            id,
            project_name
          ),
          estimate:estimate_id (
            id,
            estimate_number
          ),
          changeOrder:change_order_id (
            id,
            co_number
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!bidRequest) return null

      // Get bid items
      const { data: items, error: itemsError } = await supabase
        .from("bid_items")
        .select(`
          *,
          estimateLineItem:estimate_line_item_id (
            *
          ),
          changeOrderLineItem:change_order_line_item_id (
            *
          )
        `)
        .eq("bid_request_id", id)
        .order("sort_order")

      if (itemsError) throw itemsError

      // Get subcontractors
      const { data: subcontractors, error: subcontractorsError } = await supabase
        .from("bid_subcontractors")
        .select(`
          *,
          subcontractor:subcontractor_id (
            *
          )
        `)
        .eq("bid_request_id", id)

      if (subcontractorsError) throw subcontractorsError

      // Get responses
      const { data: responses, error: responsesError } = await supabase
        .from("bid_responses")
        .select(`
          *,
          subcontractor:subcontractor_id (
            *
          )
        `)
        .eq("bid_request_id", id)

      if (responsesError) throw responsesError

      // Get response items for each response
      const responsesWithItems = await Promise.all(
        (responses || []).map(async (response) => {
          const { data: responseItems, error: responseItemsError } = await supabase
            .from("bid_response_items")
            .select("*")
            .eq("bid_response_id", response.id)

          if (responseItemsError) throw responseItemsError

          return {
            ...response,
            items: responseItems || [],
          }
        }),
      )

      // Get attachments
      const { data: attachments, error: attachmentsError } = await supabase
        .from("bid_attachments")
        .select("*")
        .eq("bid_request_id", id)

      if (attachmentsError) throw attachmentsError

      return {
        ...bidRequest,
        items: items || [],
        subcontractors: subcontractors || [],
        responses: responsesWithItems || [],
        attachments: attachments || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createBidRequest(bidRequest: NewBidRequest, items: NewBidItem[] = []): Promise<BidRequest> {
    try {
      const bidRequestId = uuidv4()
      const now = new Date().toISOString()

      // Create the bid request
      const { data, error } = await supabase
        .from("bid_requests")
        .insert({
          id: bidRequestId,
          project_id: bidRequest.project_id,
          estimate_id: bidRequest.estimate_id || null,
          change_order_id: bidRequest.change_order_id || null,
          title: bidRequest.title,
          description: bidRequest.description || null,
          trade_category: bidRequest.trade_category || null,
          status: bidRequest.status || "draft",
          due_date: bidRequest.due_date || null,
          created_by: bidRequest.created_by || null,
          notes: bidRequest.notes || null,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) throw error

      // Create bid items if provided
      if (items.length > 0) {
        const bidItems = items.map((item, index) => ({
          id: uuidv4(),
          bid_request_id: bidRequestId,
          estimate_line_item_id: item.estimate_line_item_id || null,
          change_order_line_item_id: item.change_order_line_item_id || null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          estimated_cost: item.estimated_cost || null,
          estimated_total: item.estimated_total || null,
          sort_order: item.sort_order !== undefined ? item.sort_order : index,
          created_at: now,
          updated_at: now,
        }))

        const { error: itemsError } = await supabase.from("bid_items").insert(bidItems)

        if (itemsError) throw itemsError

        // Update has_bids flag on estimate line items
        if (bidRequest.estimate_id) {
          const estimateLineItemIds = items
            .filter((item) => item.estimate_line_item_id)
            .map((item) => item.estimate_line_item_id)

          if (estimateLineItemIds.length > 0) {
            const { error: updateError } = await supabase
              .from("estimate_line_items")
              .update({ has_bids: true })
              .in("id", estimateLineItemIds as string[])

            if (updateError) throw updateError
          }
        }

        // Update has_bids flag on change order line items
        if (bidRequest.change_order_id) {
          const changeOrderLineItemIds = items
            .filter((item) => item.change_order_line_item_id)
            .map((item) => item.change_order_line_item_id)

          if (changeOrderLineItemIds.length > 0) {
            const { error: updateError } = await supabase
              .from("change_order_line_items")
              .update({ has_bids: true })
              .in("id", changeOrderLineItemIds as string[])

            if (updateError) throw updateError
          }
        }
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateBidRequest(id: string, updates: UpdateBidRequest): Promise<BidRequest> {
    try {
      const { data, error } = await supabase
        .from("bid_requests")
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
  },

  async deleteBidRequest(id: string): Promise<void> {
    try {
      // Get the bid request to check if it has estimate or change order line items
      const { data: bidRequest, error: getError } = await supabase
        .from("bid_requests")
        .select("estimate_id, change_order_id")
        .eq("id", id)
        .single()

      if (getError) throw getError

      // Get bid items to reset has_bids flag on line items
      const { data: bidItems, error: itemsError } = await supabase
        .from("bid_items")
        .select("estimate_line_item_id, change_order_line_item_id")
        .eq("bid_request_id", id)

      if (itemsError) throw itemsError

      // Delete the bid request (cascade will delete related records)
      const { error } = await supabase.from("bid_requests").delete().eq("id", id)

      if (error) throw error

      // Reset has_bids flag on estimate line items if needed
      if (bidRequest?.estimate_id) {
        const estimateLineItemIds = bidItems
          ?.filter((item) => item.estimate_line_item_id)
          .map((item) => item.estimate_line_item_id)

        if (estimateLineItemIds && estimateLineItemIds.length > 0) {
          // For each line item, check if it's used in any other bid requests
          for (const lineItemId of estimateLineItemIds) {
            const { count, error: countError } = await supabase
              .from("bid_items")
              .select("id", { count: "exact" })
              .eq("estimate_line_item_id", lineItemId)

            if (countError) throw countError

            // If no other bid requests use this line item, reset has_bids flag
            if (count === 0) {
              const { error: updateError } = await supabase
                .from("estimate_line_items")
                .update({ has_bids: false })
                .eq("id", lineItemId)

              if (updateError) throw updateError
            }
          }
        }
      }

      // Reset has_bids flag on change order line items if needed
      if (bidRequest?.change_order_id) {
        const changeOrderLineItemIds = bidItems
          ?.filter((item) => item.change_order_line_item_id)
          .map((item) => item.change_order_line_item_id)

        if (changeOrderLineItemIds && changeOrderLineItemIds.length > 0) {
          // For each line item, check if it's used in any other bid requests
          for (const lineItemId of changeOrderLineItemIds) {
            const { count, error: countError } = await supabase
              .from("bid_items")
              .select("id", { count: "exact" })
              .eq("change_order_line_item_id", lineItemId)

            if (countError) throw countError

            // If no other bid requests use this line item, reset has_bids flag
            if (count === 0) {
              const { error: updateError } = await supabase
                .from("change_order_line_items")
                .update({ has_bids: false })
                .eq("id", lineItemId)

              if (updateError) throw updateError
            }
          }
        }
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addBidItem(item: NewBidItem): Promise<BidItem> {
    try {
      // Get the current highest sort order
      const { data: existingItems, error: countError } = await supabase
        .from("bid_items")
        .select("sort_order")
        .eq("bid_request_id", item.bid_request_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (countError) throw countError

      const sortOrder = existingItems && existingItems.length > 0 ? existingItems[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from("bid_items")
        .insert({
          ...item,
          sort_order: item.sort_order !== undefined ? item.sort_order : sortOrder,
        })
        .select()
        .single()

      if (error) throw error

      // Update has_bids flag on estimate line item if needed
      if (item.estimate_line_item_id) {
        const { error: updateError } = await supabase
          .from("estimate_line_items")
          .update({ has_bids: true })
          .eq("id", item.estimate_line_item_id)

        if (updateError) throw updateError
      }

      // Update has_bids flag on change order line item if needed
      if (item.change_order_line_item_id) {
        const { error: updateError } = await supabase
          .from("change_order_line_items")
          .update({ has_bids: true })
          .eq("id", item.change_order_line_item_id)

        if (updateError) throw updateError
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateBidItem(id: string, updates: UpdateBidItem): Promise<BidItem> {
    try {
      const { data, error } = await supabase
        .from("bid_items")
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
  },

  async deleteBidItem(id: string): Promise<void> {
    try {
      // Get the bid item to check if it has estimate or change order line items
      const { data: bidItem, error: getError } = await supabase
        .from("bid_items")
        .select("estimate_line_item_id, change_order_line_item_id")
        .eq("id", id)
        .single()

      if (getError) throw getError

      // Delete the bid item
      const { error } = await supabase.from("bid_items").delete().eq("id", id)

      if (error) throw error

      // Check if the estimate line item is used in any other bid items
      if (bidItem?.estimate_line_item_id) {
        const { count, error: countError } = await supabase
          .from("bid_items")
          .select("id", { count: "exact" })
          .eq("estimate_line_item_id", bidItem.estimate_line_item_id)

        if (countError) throw countError

        // If no other bid items use this line item, reset has_bids flag
        if (count === 0) {
          const { error: updateError } = await supabase
            .from("estimate_line_items")
            .update({ has_bids: false })
            .eq("id", bidItem.estimate_line_item_id)

          if (updateError) throw updateError
        }
      }

      // Check if the change order line item is used in any other bid items
      if (bidItem?.change_order_line_item_id) {
        const { count, error: countError } = await supabase
          .from("bid_items")
          .select("id", { count: "exact" })
          .eq("change_order_line_item_id", bidItem.change_order_line_item_id)

        if (countError) throw countError

        // If no other bid items use this line item, reset has_bids flag
        if (count === 0) {
          const { error: updateError } = await supabase
            .from("change_order_line_items")
            .update({ has_bids: false })
            .eq("id", bidItem.change_order_line_item_id)

          if (updateError) throw updateError
        }
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addSubcontractorToBid(
    bidRequestId: string,
    subcontractorId: string,
    notes?: string,
  ): Promise<BidSubcontractor> {
    try {
      const { data, error } = await supabase
        .from("bid_subcontractors")
        .insert({
          bid_request_id: bidRequestId,
          subcontractor_id: subcontractorId,
          status: "invited",
          notes: notes || null,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async removeSubcontractorFromBid(bidRequestId: string, subcontractorId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("bid_subcontractors")
        .delete()
        .eq("bid_request_id", bidRequestId)
        .eq("subcontractor_id", subcontractorId)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async sendBidRequest(id: string, subcontractorIds: string[]): Promise<void> {
    try {
      const now = new Date().toISOString()

      // Update bid request status
      const { error: updateError } = await supabase
        .from("bid_requests")
        .update({
          status: "sent",
          sent_at: now,
          updated_at: now,
        })
        .eq("id", id)

      if (updateError) throw updateError

      // Add subcontractors if they don't exist yet
      for (const subcontractorId of subcontractorIds) {
        const { count, error: countError } = await supabase
          .from("bid_subcontractors")
          .select("id", { count: "exact" })
          .eq("bid_request_id", id)
          .eq("subcontractor_id", subcontractorId)

        if (countError) throw countError

        if (count === 0) {
          await this.addSubcontractorToBid(id, subcontractorId)
        }
      }

      // TODO: Send email notifications to subcontractors
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async recordBidResponse(
    bidRequestId: string,
    subcontractorId: string,
    totalAmount: number,
    items: { bidItemId: string; unitPrice: number; totalPrice: number; notes?: string }[],
    notes?: string,
    estimatedDuration?: number,
    estimatedStartDate?: string,
  ): Promise<BidResponse> {
    try {
      const now = new Date().toISOString()

      // Create or update bid response
      const { data: existingResponse, error: checkError } = await supabase
        .from("bid_responses")
        .select("id")
        .eq("bid_request_id", bidRequestId)
        .eq("subcontractor_id", subcontractorId)
        .maybeSingle()

      if (checkError) throw checkError

      let responseId: string
      let response: BidResponse

      if (existingResponse) {
        // Update existing response
        const { data, error } = await supabase
          .from("bid_responses")
          .update({
            total_amount: totalAmount,
            notes: notes || null,
            estimated_duration: estimatedDuration || null,
            estimated_start_date: estimatedStartDate || null,
            updated_at: now,
          })
          .eq("id", existingResponse.id)
          .select()
          .single()

        if (error) throw error
        responseId = existingResponse.id
        response = data
      } else {
        // Create new response
        const { data, error } = await supabase
          .from("bid_responses")
          .insert({
            bid_request_id: bidRequestId,
            subcontractor_id: subcontractorId,
            total_amount: totalAmount,
            status: "submitted",
            notes: notes || null,
            estimated_duration: estimatedDuration || null,
            estimated_start_date: estimatedStartDate || null,
            created_at: now,
            updated_at: now,
          })
          .select()
          .single()

        if (error) throw error
        responseId = data.id
        response = data

        // Update subcontractor status
        const { error: subError } = await supabase
          .from("bid_subcontractors")
          .update({
            status: "responded",
            responded_at: now,
            updated_at: now,
          })
          .eq("bid_request_id", bidRequestId)
          .eq("subcontractor_id", subcontractorId)

        if (subError) throw subError

        // Update bid request status if it's the first response
        const { count, error: countError } = await supabase
          .from("bid_responses")
          .select("id", { count: "exact" })
          .eq("bid_request_id", bidRequestId)

        if (countError) throw countError

        if (count === 1) {
          const { error: updateError } = await supabase
            .from("bid_requests")
            .update({
              status: "responded",
              updated_at: now,
            })
            .eq("id", bidRequestId)

          if (updateError) throw updateError
        }
      }

      // Delete existing response items
      const { error: deleteError } = await supabase
        .from("bid_response_items")
        .delete()
        .eq("bid_response_id", responseId)

      if (deleteError) throw deleteError

      // Create new response items
      if (items.length > 0) {
        const responseItems = items.map((item) => ({
          bid_response_id: responseId,
          bid_item_id: item.bidItemId,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          notes: item.notes || null,
          created_at: now,
          updated_at: now,
        }))

        const { error: itemsError } = await supabase.from("bid_response_items").insert(responseItems)

        if (itemsError) throw itemsError
      }

      return response
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async awardBid(bidRequestId: string, subcontractorId: string): Promise<void> {
    try {
      const now = new Date().toISOString()

      // Update bid request
      const { error } = await supabase
        .from("bid_requests")
        .update({
          status: "awarded",
          awarded_to: subcontractorId,
          awarded_at: now,
          updated_at: now,
        })
        .eq("id", bidRequestId)

      if (error) throw error

      // Update bid response status
      const { error: responseError } = await supabase
        .from("bid_responses")
        .update({
          status: "accepted",
          updated_at: now,
        })
        .eq("bid_request_id", bidRequestId)
        .eq("subcontractor_id", subcontractorId)

      if (responseError) throw responseError

      // Update other bid responses to rejected
      const { error: otherResponsesError } = await supabase
        .from("bid_responses")
        .update({
          status: "rejected",
          updated_at: now,
        })
        .eq("bid_request_id", bidRequestId)
        .neq("subcontractor_id", subcontractorId)

      if (otherResponsesError) throw otherResponsesError

      // TODO: Send notifications to subcontractors
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getBidComparison(bidRequestId: string): Promise<BidComparisonResult> {
    try {
      // Get the bid request
      const { data: bidRequest, error } = await supabase
        .from("bid_requests")
        .select("estimate_id, change_order_id")
        .eq("id", bidRequestId)
        .single()

      if (error) throw error

      // Get bid items with estimated costs
      const { data: bidItems, error: itemsError } = await supabase
        .from("bid_items")
        .select("id, estimated_cost, estimated_total")
        .eq("bid_request_id", bidRequestId)

      if (itemsError) throw itemsError

      // Get bid responses
      const { data: responses, error: responsesError } = await supabase
        .from("bid_responses")
        .select("id, total_amount")
        .eq("bid_request_id", bidRequestId)

      if (responsesError) throw responsesError

      // Calculate totals
      const totalEstimatedCost = bidItems?.reduce((sum, item) => sum + (item.estimated_total || 0), 0) || 0
      const bidAmounts = responses?.map((response) => response.total_amount) || []
      const lowestBidAmount = bidAmounts.length > 0 ? Math.min(...bidAmounts) : 0
      const highestBidAmount = bidAmounts.length > 0 ? Math.max(...bidAmounts) : 0
      const averageBidAmount =
        bidAmounts.length > 0 ? bidAmounts.reduce((sum, amount) => sum + amount, 0) / bidAmounts.length : 0
      const bidCount = bidAmounts.length

      // Calculate margin impact
      const marginImpact = totalEstimatedCost - lowestBidAmount
      const marginPercentage = totalEstimatedCost > 0 ? (marginImpact / totalEstimatedCost) * 100 : 0

      // Check if any bids exceed estimated costs
      const hasOverBudgetItems = lowestBidAmount > totalEstimatedCost

      return {
        bidRequestId,
        estimateId: bidRequest?.estimate_id || undefined,
        changeOrderId: bidRequest?.change_order_id || undefined,
        totalEstimatedCost,
        lowestBidAmount,
        highestBidAmount,
        averageBidAmount,
        bidCount,
        marginImpact,
        marginPercentage,
        hasOverBudgetItems,
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getBidItemComparison(bidRequestId: string): Promise<BidItemComparisonResult[]> {
    try {
      // Get bid items
      const { data: bidItems, error: itemsError } = await supabase
        .from("bid_items")
        .select("id, estimate_line_item_id, change_order_line_item_id, description, estimated_cost, estimated_total")
        .eq("bid_request_id", bidRequestId)

      if (itemsError) throw itemsError
      if (!bidItems || bidItems.length === 0) return []

      // Get all bid responses for this request
      const { data: responses, error: responsesError } = await supabase
        .from("bid_responses")
        .select("id")
        .eq("bid_request_id", bidRequestId)

      if (responsesError) throw responsesError
      if (!responses || responses.length === 0) return []

      // For each bid item, get all response items
      const itemComparisons: BidItemComparisonResult[] = await Promise.all(
        bidItems.map(async (item) => {
          const { data: responseItems, error: responseItemsError } = await supabase
            .from("bid_response_items")
            .select("unit_price, total_price")
            .eq("bid_item_id", item.id)
            .in(
              "bid_response_id",
              responses.map((r) => r.id),
            )

          if (responseItemsError) throw responseItemsError

          const prices = responseItems?.map((ri) => ri.total_price) || []
          const lowestBidPrice = prices.length > 0 ? Math.min(...prices) : 0
          const highestBidPrice = prices.length > 0 ? Math.max(...prices) : 0
          const averageBidPrice = prices.length > 0 ? prices.reduce((sum, price) => sum + price, 0) / prices.length : 0
          const bidCount = prices.length

          const estimatedCost = item.estimated_total || 0
          const variance = estimatedCost - lowestBidPrice
          const variancePercentage = estimatedCost > 0 ? (variance / estimatedCost) * 100 : 0
          const isOverBudget = lowestBidPrice > estimatedCost

          return {
            bidItemId: item.id,
            estimateLineItemId: item.estimate_line_item_id || undefined,
            changeOrderLineItemId: item.change_order_line_item_id || undefined,
            description: item.description,
            estimatedCost,
            lowestBidPrice,
            highestBidPrice,
            averageBidPrice,
            bidCount,
            variance,
            variancePercentage,
            isOverBudget,
          }
        }),
      )

      return itemComparisons
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateEstimateFromBid(
    estimateId: string,
    bidRequestId: string,
    subcontractorId: string,
    options: { applyMargin?: number; updateAll?: boolean } = {},
  ): Promise<void> {
    try {
      // Get the bid response
      const { data: bidResponse, error: responseError } = await supabase
        .from("bid_responses")
        .select("id")
        .eq("bid_request_id", bidRequestId)
        .eq("subcontractor_id", subcontractorId)
        .single()

      if (responseError) throw responseError
      if (!bidResponse) throw new Error("Bid response not found")

      // Get bid items with response items and estimate line item IDs
      const { data: bidItems, error: itemsError } = await supabase
        .from("bid_items")
        .select(`
          id, 
          estimate_line_item_id,
          bid_response_items!inner(
            unit_price, 
            total_price
          )
        `)
        .eq("bid_request_id", bidRequestId)
        .eq("bid_response_items.bid_response_id", bidResponse.id)
        .not("estimate_line_item_id", "is", null)

      if (itemsError) throw itemsError
      if (!bidItems || bidItems.length === 0) return

      // Update each estimate line item
      for (const item of bidItems) {
        if (!item.estimate_line_item_id || !item.bid_response_items || item.bid_response_items.length === 0) continue

        const responseItem = item.bid_response_items[0]
        let unitCost = responseItem.unit_price
        let total = responseItem.total_price

        // Apply margin if specified
        if (options.applyMargin && options.applyMargin > 0) {
          const marginMultiplier = 1 + options.applyMargin / 100
          unitCost = unitCost * marginMultiplier
          total = total * marginMultiplier
        }

        // Get the current estimate line item
        const { data: estimateLineItem, error: lineItemError } = await supabase
          .from("estimate_line_items")
          .select("quantity, markup")
          .eq("id", item.estimate_line_item_id)
          .single()

        if (lineItemError) throw lineItemError

        // Update the estimate line item
        const { error: updateError } = await supabase
          .from("estimate_line_items")
          .update({
            unit_cost: unitCost,
            total: total,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.estimate_line_item_id)

        if (updateError) throw updateError
      }

      // Update the estimate totals
      await this.recalculateEstimateTotals(estimateId)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async recalculateEstimateTotals(estimateId: string): Promise<void> {
    try {
      // Get all line items for the estimate
      const { data: lineItems, error: itemsError } = await supabase
        .from("estimate_line_items")
        .select("total")
        .eq("estimate_id", estimateId)

      if (itemsError) throw itemsError

      // Calculate subtotal
      const subtotal = lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0

      // Get the current discount settings
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select("discount_type, discount_value")
        .eq("id", estimateId)
        .single()

      if (estimateError) throw estimateError

      // Calculate total with discount
      let totalAmount = subtotal
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotal * (1 - estimate.discount_value / 100)
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotal - estimate.discount_value
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount)

      // Update the estimate with the new total
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          subtotal_amount: subtotal,
          total_amount: totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", estimateId)

      if (updateError) throw updateError
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateChangeOrderFromBid(
    changeOrderId: string,
    bidRequestId: string,
    subcontractorId: string,
    options: { applyMargin?: number; updateAll?: boolean } = {},
  ): Promise<void> {
    try {
      // Get the bid response
      const { data: bidResponse, error: responseError } = await supabase
        .from("bid_responses")
        .select("id")
        .eq("bid_request_id", bidRequestId)
        .eq("subcontractor_id", subcontractorId)
        .single()

      if (responseError) throw responseError
      if (!bidResponse) throw new Error("Bid response not found")

      // Get bid items with response items and change order line item IDs
      const { data: bidItems, error: itemsError } = await supabase
        .from("bid_items")
        .select(`
          id, 
          change_order_line_item_id,
          bid_response_items!inner(
            unit_price, 
            total_price
          )
        `)
        .eq("bid_request_id", bidRequestId)
        .eq("bid_response_items.bid_response_id", bidResponse.id)
        .not("change_order_line_item_id", "is", null)

      if (itemsError) throw itemsError
      if (!bidItems || bidItems.length === 0) return

      // Update each change order line item
      for (const item of bidItems) {
        if (!item.change_order_line_item_id || !item.bid_response_items || item.bid_response_items.length === 0)
          continue

        const responseItem = item.bid_response_items[0]
        let unitCost = responseItem.unit_price
        let total = responseItem.total_price

        // Apply margin if specified
        if (options.applyMargin && options.applyMargin > 0) {
          const marginMultiplier = 1 + options.applyMargin / 100
          unitCost = unitCost * marginMultiplier
          total = total * marginMultiplier
        }

        // Update the change order line item
        const { error: updateError } = await supabase
          .from("change_order_line_items")
          .update({
            unit_cost: unitCost,
            total: total,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.change_order_line_item_id)

        if (updateError) throw updateError
      }

      // Update the change order total
      await this.recalculateChangeOrderTotal(changeOrderId)
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async recalculateChangeOrderTotal(changeOrderId: string): Promise<void> {
    try {
      // Get all line items for the change order
      const { data: lineItems, error: itemsError } = await supabase
        .from("change_order_line_items")
        .select("total")
        .eq("change_order_id", changeOrderId)

      if (itemsError) throw itemsError

      // Calculate total
      const total = lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0

      // Update the change order with the new total
      const { error: updateError } = await supabase
        .from("change_orders")
        .update({
          cost_impact: total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", changeOrderId)

      if (updateError) throw updateError
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getTradeGroupedItems(
    estimateId?: string,
    changeOrderId?: string,
    options: { excludeWithBids?: boolean } = {},
  ): Promise<TradeGroupedItems> {
    try {
      const result: TradeGroupedItems = {}

      if (estimateId) {
        // Get estimate line items
        let query = supabase
          .from("estimate_line_items")
          .select("*, costItem:cost_item_id(*)")
          .eq("estimate_id", estimateId)
          .order("sort_order")

        if (options.excludeWithBids) {
          query = query.eq("has_bids", false)
        }

        const { data: lineItems, error } = await query

        if (error) throw error

        if (lineItems && lineItems.length > 0) {
          lineItems.forEach((item) => {
            // Determine trade category
            let tradeCategory: string = item.trade_category || "general"
            if (!tradeCategory && item.costItem?.type) {
              tradeCategory = this.mapCostItemTypeToTradeCategory(item.costItem.type)
            }

            // Initialize category if it doesn't exist
            if (!result[tradeCategory]) {
              result[tradeCategory] = {
                items: [],
                totalEstimatedCost: 0,
              }
            }

            // Add item to category
            result[tradeCategory].items.push(item)
            result[tradeCategory].totalEstimatedCost += item.total || 0
          })
        }
      }

      if (changeOrderId) {
        // Get change order line items
        let query = supabase
          .from("change_order_line_items")
          .select("*")
          .eq("change_order_id", changeOrderId)
          .order("sort_order")

        if (options.excludeWithBids) {
          query = query.eq("has_bids", false)
        }

        const { data: lineItems, error } = await query

        if (error) throw error

        if (lineItems && lineItems.length > 0) {
          lineItems.forEach((item) => {
            // Determine trade category
            const tradeCategory = item.trade_category || "general"

            // Initialize category if it doesn't exist
            if (!result[tradeCategory]) {
              result[tradeCategory] = {
                items: [],
                totalEstimatedCost: 0,
              }
            }

            // Add item to category
            result[tradeCategory].items.push(item)
            result[tradeCategory].totalEstimatedCost += item.total || 0
          })
        }
      }

      return result
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  mapCostItemTypeToTradeCategory(costItemType: string): TradeCategory {
    const typeToCategory: Record<string, TradeCategory> = {
      electrical: "electrical",
      plumbing: "plumbing",
      hvac: "hvac",
      carpentry: "carpentry",
      masonry: "masonry",
      roofing: "roofing",
      flooring: "flooring",
      painting: "painting",
      landscaping: "landscaping",
      concrete: "concrete",
      drywall: "drywall",
      insulation: "insulation",
      windows: "windows_doors",
      doors: "windows_doors",
      siding: "siding",
      cleaning: "cleaning",
      demolition: "demolition",
      excavation: "excavation",
    }

    const lowerType = costItemType.toLowerCase()
    for (const [key, value] of Object.entries(typeToCategory)) {
      if (lowerType.includes(key)) {
        return value
      }
    }

    return "other"
  },

  async getSubcontractorsByTrade(tradeCategory?: TradeCategory): Promise<Person[]> {
    try {
      let query = supabase.from("people").select("*").eq("person_type", "Subcontractor").order("business_name")

      if (tradeCategory) {
        query = query.contains("trade_categories", [tradeCategory])
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
