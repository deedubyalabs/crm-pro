import { supabase, handleSupabaseError } from "./supabase"
import type { BidRequest, NewBidRequest, UpdateBidRequest, BidRequestFilters, Bid, NewBid, UpdateBid } from "@/types/bidding"
import type { Subcontractor, NewSubcontractor, UpdateSubcontractor } from "@/types/subcontractor" // Assuming you'll create this type

export const biddingService = {
  async getBidRequests(filters?: BidRequestFilters): Promise<BidRequest[]> {
    try {
      let query = supabase
        .from("bid_requests")
        .select(`
          id,
          estimate_id,
          project_id,
          title,
          description,
          status,
          due_date,
          created_at,
          updated_at,
          line_items:bid_request_line_items(
            id,
            bid_request_id,
            estimate_line_item_id,
            description,
            quantity,
            unit,
            unit_cost,
            markup,
            total,
            sort_order,
            section_name,
            is_optional,
            is_taxable,
            assigned_to_user_id
          ),
          subcontractor_bids:bids(
            id,
            bid_request_id,
            subcontractor_id,
            amount,
            status,
            notes,
            bid_document_url,
            submitted_at,
            subcontractor:subcontractors(
              id,
              business_name,
              first_name,
              last_name,
              email
            ),
            bid_line_items:bids_line_items(
              id,
              bid_id,
              bid_request_line_item_id,
              description,
              quantity,
              unit,
              unit_price,
              total,
              notes
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (filters?.estimateId) {
        query = query.eq("estimate_id", filters.estimateId);
      }
      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId);
      }
      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      // Note: tradeCategory filtering would apply to line_items or a separate field on bid_requests
      // For now, removing it from top-level filter as it's not directly on bid_requests table
      // if (filters?.tradeCategory) {
      //   query = query.eq("trade_category", filters.tradeCategory)
      // }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as BidRequest[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getBidRequestById(id: string): Promise<BidRequest | null> {
    try {
      const { data, error } = await supabase
        .from("bid_requests")
        .select(`
          id,
          estimate_id,
          project_id,
          title,
          description,
          status,
          due_date,
          created_at,
          updated_at,
          line_items:bid_request_line_items(
            id,
            bid_request_id,
            estimate_line_item_id,
            description,
            quantity,
            unit,
            unit_cost,
            markup,
            total,
            sort_order,
            section_name,
            is_optional,
            is_taxable,
            assigned_to_user_id
          ),
          subcontractor_bids:bids(
            id,
            bid_request_id,
            subcontractor_id,
            amount,
            status,
            notes,
            bid_document_url,
            submitted_at,
            subcontractor:subcontractors(
              id,
              business_name,
              first_name,
              last_name,
              email
            ),
            bid_line_items:bids_line_items(
              id,
              bid_id,
              bid_request_line_item_id,
              description,
              quantity,
              unit,
              unit_price,
              total,
              notes
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return (data || null) as unknown as BidRequest;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async createBidRequest(bidRequest: NewBidRequest): Promise<BidRequest> {
    try {
      // Separate line_items from the main bidRequest object
      const { line_items, ...newBidRequestData } = bidRequest;

      const { data, error } = await supabase
        .from("bid_requests")
        .insert(newBidRequestData as any)
        .select(`
          id,
          estimate_id,
          project_id,
          title,
          description,
          status,
          due_date,
          created_at,
          updated_at
        `) // Select only top-level fields for the initial insert response
        .single();

      if (error) throw error;
      const createdBidRequest = data as BidRequest;

      // Insert line items
      if (line_items && line_items.length > 0) {
        const bidRequestLineItems = line_items.map(item => ({
          ...item,
          bid_request_id: createdBidRequest.id, // Link to the newly created bid request
          // Ensure estimate_line_item_id is used if available, otherwise it's a new item
          estimate_line_item_id: item.id, // Assuming the id from BidPackageLineItem is the original estimate_line_item_id
        }));
        const { error: lineItemsError } = await supabase
          .from("bid_request_line_items")
          .insert(bidRequestLineItems as any);
        if (lineItemsError) throw lineItemsError;
      }

      // Re-fetch the full bid request with nested data
      return (await this.getBidRequestById(createdBidRequest.id)) as BidRequest;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateBidRequest(id: string, updates: UpdateBidRequest): Promise<BidRequest> {
    try {
      // Separate line_items from updates if present
      const { line_items, ...updateBidRequestData } = updates;

      // Update main bid_requests table
      const { data, error } = await supabase
        .from("bid_requests")
        .update({ ...updateBidRequestData, updated_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select(`
          id,
          estimate_id,
          project_id,
          title,
          description,
          status,
          due_date,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      const updatedBidRequest = data as BidRequest;

      // Handle line_items update: This is more complex.
      // For simplicity, we can delete existing and re-insert.
      // A more robust solution would involve diffing and updating.
      if (line_items !== undefined) {
        // Delete existing line items for this bid request
        const { error: deleteError } = await supabase
          .from("bid_request_line_items")
          .delete()
          .eq("bid_request_id", id);
        if (deleteError) throw deleteError;

        // Insert new line items
        if (line_items && line_items.length > 0) {
          const bidRequestLineItems = line_items.map(item => ({
            ...item,
            bid_request_id: updatedBidRequest.id,
            estimate_line_item_id: item.id, // Assuming the id from BidPackageLineItem is the original estimate_line_item_id
          }));
          const { error: insertError } = await supabase
            .from("bid_request_line_items")
            .insert(bidRequestLineItems as any);
          if (insertError) throw insertError;
        }
      }

      // Re-fetch the full bid request with nested data
      return (await this.getBidRequestById(updatedBidRequest.id)) as BidRequest;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteBidRequest(id: string): Promise<void> {
    try {
      // Delete associated line items first due to foreign key constraints
      const { error: lineItemsError } = await supabase
        .from("bid_request_line_items")
        .delete()
        .eq("bid_request_id", id);
      if (lineItemsError) throw lineItemsError;

      // Delete associated bids (if any, or handle cascade delete in DB)
      const { error: bidsError } = await supabase
        .from("bids")
        .delete()
        .eq("bid_request_id", id);
      if (bidsError) throw bidsError;

      const { error } = await supabase.from("bid_requests").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // --- Bid-related functions ---
  async getBid(id: string): Promise<Bid | null> {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          id,
          bid_request_id,
          subcontractor_id,
          amount,
          status,
          notes,
          bid_document_url,
          submitted_at,
          created_at,
          updated_at,
          subcontractor:subcontractors(
            id,
            business_name,
            first_name,
            last_name,
            email
          ),
          bid_line_items:bids_line_items(
            id,
            bid_id,
            bid_request_line_item_id,
            description,
            quantity,
            unit,
            unit_price,
            total,
            notes
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return (data || null) as unknown as Bid;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getBidsForBidRequest(bidRequestId: string): Promise<Bid[]> {
    try {
      const { data, error } = await supabase
        .from("bids")
        .select(`
          id,
          bid_request_id,
          subcontractor_id,
          amount,
          status,
          notes,
          bid_document_url,
          submitted_at,
          created_at,
          updated_at,
          subcontractor:subcontractors(
            id,
            business_name,
            first_name,
            last_name,
            email
          ),
          bid_line_items:bids_line_items(
            id,
            bid_id,
            bid_request_line_item_id,
            description,
            quantity,
            unit,
            unit_price,
            total,
            notes
          )
        `)
        .eq("bid_request_id", bidRequestId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as Bid[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async createBid(bid: NewBid): Promise<Bid> {
    try {
      const { bid_line_items, ...newBidData } = bid;

      const { data, error } = await supabase
        .from("bids")
        .insert({ ...newBidData, submitted_at: new Date().toISOString() } as any)
        .select(`
          id,
          bid_request_id,
          subcontractor_id,
          amount,
          status,
          notes,
          bid_document_url,
          submitted_at,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      const createdBid = data as Bid;

      // Insert bid line items
      if (bid_line_items && bid_line_items.length > 0) {
        const bidLineItemsToInsert = bid_line_items.map(item => ({
          ...item,
          bid_id: createdBid.id, // Link to the newly created bid
        }));
        const { error: bidLineItemsError } = await supabase
          .from("bids_line_items")
          .insert(bidLineItemsToInsert as any);
        if (bidLineItemsError) throw bidLineItemsError;
      }

      // Re-fetch the full bid with nested data
      return (await this.getBid(createdBid.id)) as Bid;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateBid(id: string, updates: UpdateBid): Promise<Bid> {
    try {
      const { bid_line_items, ...updateBidData } = updates;

      const { data, error } = await supabase
        .from("bids")
        .update({ ...updateBidData, updated_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select(`
          id,
          bid_request_id,
          subcontractor_id,
          amount,
          status,
          notes,
          bid_document_url,
          submitted_at,
          created_at,
          updated_at
        `)
        .single();

      if (error) throw error;
      const updatedBid = data as Bid;

      // Handle bid_line_items update: Delete existing and re-insert
      if (bid_line_items !== undefined) {
        const { error: deleteError } = await supabase
          .from("bids_line_items")
          .delete()
          .eq("bid_id", id);
        if (deleteError) throw deleteError;

        if (bid_line_items.length > 0) {
          const bidLineItemsToInsert = bid_line_items.map(item => ({
            ...item,
            bid_id: updatedBid.id,
          }));
          const { error: insertError } = await supabase
            .from("bids_line_items")
            .insert(bidLineItemsToInsert as any);
          if (insertError) throw insertError;
        }
      }

      // Re-fetch the full bid with nested data
      return (await this.getBid(updatedBid.id)) as Bid;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteBid(id: string): Promise<void> {
    try {
      // Delete associated bid line items first
      const { error: bidLineItemsError } = await supabase
        .from("bids_line_items")
        .delete()
        .eq("bid_id", id);
      if (bidLineItemsError) throw bidLineItemsError;

      const { error } = await supabase.from("bids").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // --- Subcontractor-related functions ---
  async getSubcontractors(filters?: { search?: string }): Promise<Subcontractor[]> {
    try {
      let query = supabase
        .from("subcontractors")
        .select("*") // Select all fields for now, can be optimized later
        .order("business_name", { ascending: true });

      if (filters?.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,business_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []) as unknown as Subcontractor[];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getSubcontractorById(id: string): Promise<Subcontractor | null> {
    try {
      const { data, error } = await supabase
        .from("subcontractors")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return (data || null) as unknown as Subcontractor;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async createSubcontractor(subcontractor: NewSubcontractor): Promise<Subcontractor> {
    try {
      const { data, error } = await supabase
        .from("subcontractors")
        .insert(subcontractor as any)
        .select("*")
        .single();

      if (error) throw error;
      return data as unknown as Subcontractor;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateSubcontractor(id: string, updates: UpdateSubcontractor): Promise<Subcontractor> {
    try {
      const { data, error } = await supabase
        .from("subcontractors")
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data as unknown as Subcontractor;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async deleteSubcontractor(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("subcontractors").delete().eq("id", id);
      if (error) throw error;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  }
}
