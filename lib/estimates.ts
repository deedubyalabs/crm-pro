import { supabase, handleSupabaseError } from "./supabase"
import type {
  Estimate,
  NewEstimate,
  UpdateEstimate,
  EstimateLineItem,
  NewEstimateLineItem,
  UpdateEstimateLineItem,
  EstimateWithDetails,
  EstimateFilters,
  EstimatePaymentSchedule,
  NewEstimatePaymentSchedule,
  UpdateEstimatePaymentSchedule,
  LineItemsBySection,
} from "@/types/estimates"
import { blueprintOfValuesService } from "./blueprint-of-values";
import { invoiceService, Invoice } from "./invoices"; // Import Invoice type from lib/invoices

export const estimateService = {
  // Helper to handle actions when an estimate is accepted
  async handleEstimateAccepted(estimateId: string, userId: string | null): Promise<{ bovGenerated: boolean; initialInvoiceGenerated: boolean; bovId: string | null; invoiceId: string | null }> {
    let bovGenerated = false;
    let initialInvoiceGenerated = false;
    let bovId: string | null = null;
    let invoiceId: string | null = null;

    try {
      const estimate = await this.getEstimateById(estimateId);
      if (!estimate) {
        console.warn(`Estimate with ID ${estimateId} not found for handling acceptance.`);
        return { bovGenerated, initialInvoiceGenerated, bovId: null, invoiceId: null };
      }

      // 1. Generate Blueprint of Values (BOV) if not already converted
      if (!estimate.is_converted_to_bov) {
        try {
          const newBov = await blueprintOfValuesService.convertEstimateToBlueprintOfValues(estimateId, userId);
          bovGenerated = true;
          bovId = newBov.id;
          console.log(`BOV generated for estimate ${estimateId} with ID ${bovId}`);
        } catch (error) {
          console.error(`Failed to generate BOV for estimate ${estimateId}:`, error);
          // Continue even if BOV generation fails
        }
      }

      // 2. Generate Initial Invoice if not already generated
      if (!estimate.is_initial_invoice_generated && estimate.deposit_required && estimate.deposit_amount) {
        try {
          const newInvoice: Invoice = {
            project_id: estimate.project_id!, // Assuming project_id is not null if estimate is accepted
            person_id: estimate.person_id,
            invoice_number: await invoiceService.getNextInvoiceNumber(),
            status: "Draft", // Or "Sent" depending on desired flow
            issue_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
            total_amount: estimate.deposit_amount,
            amount_paid: 0,
            notes: `Deposit invoice for Estimate ${estimate.estimate_number}`,
            created_by_user_id: userId,
            line_items: [{
              description: `Deposit for Estimate ${estimate.estimate_number}`,
              quantity: 1,
              unit: "each",
              unit_price: estimate.deposit_amount,
              total: estimate.deposit_amount,
              sort_order: 0,
            }],
            id: ""
          };
          const createdInvoiceId = await invoiceService.createInvoice(newInvoice);
          initialInvoiceGenerated = true;
          invoiceId = createdInvoiceId;
          console.log(`Initial deposit invoice generated for estimate ${estimateId} with ID ${invoiceId}`);

          // Update the estimate to mark it as initial invoice generated and link the invoice
          await supabase.from("estimates").update({
            is_initial_invoice_generated: true,
            initial_invoice_id: invoiceId,
            updated_at: new Date().toISOString(),
          }).eq("id", estimateId);

        } catch (error) {
          console.error(`Failed to generate initial invoice for estimate ${estimateId}:`, error);
          // Continue even if invoice generation fails
        }
      }

      // Update the estimate with BOV ID if generated
      if (bovId) {
        await supabase.from("estimates").update({
          blueprint_of_values_id: bovId,
          updated_at: new Date().toISOString(),
        }).eq("id", estimateId);
      }

    } catch (error) {
      console.error("Error in handleEstimateAccepted:", error);
    }
    return { bovGenerated, initialInvoiceGenerated, bovId, invoiceId };
  },

  async getEstimatesByProjectId(projectId: string): Promise<EstimateWithDetails[]> {
    try {
      const { data, error } = await supabase
        .from("estimates")
        .select(`
          id,
          estimate_number,
          title,
          status,
          project_id,
          lineItems:estimate_line_items (
            id,
            description,
            quantity,
            unit,
            unit_price,
            total
          )
        `)
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })

      if (error) throw error
      return (data || []) as unknown as EstimateWithDetails[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getEstimates(filters?: EstimateFilters): Promise<Estimate[]> {
    try {
      let query = supabase
        .from("estimates")
        .select(`
          id,
          estimate_number,
          person_id,
          opportunity_id,
          project_id,
          status,
          issue_date,
          expiration_date,
          subtotal_amount,
          discount_type,
          discount_value,
          total_amount,
          notes,
          terms_and_conditions,
          scope_of_work,
          cover_sheet_details,
          is_converted_to_project,
          is_converted_to_bov,
          is_initial_invoice_generated,
          blueprint_of_values_id,
          initial_invoice_id,
          created_at,
          updated_at,
          deposit_required,
          deposit_amount,
          deposit_percentage,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          ),
          project:project_id (
            id,
            project_name
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.opportunityId) {
        query = query.eq("opportunity_id", filters.opportunityId)
      }

      if (filters?.personId) {
        query = query.eq("person_id", filters.personId)
      }

      if (filters?.search) {
        const searchTerm = `%${filters.search}%`
        query = query.or(`estimate_number.ilike.${searchTerm},notes.ilike.${searchTerm}`)
      }

      if (filters?.startDate) {
        query = query.gte("issue_date", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("issue_date", filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return (data || []) as unknown as Estimate[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getEstimateById(id: string): Promise<EstimateWithDetails | null> {
    try {
      const { data: estimate, error } = await supabase
        .from("estimates")
        .select(`
          id,
          estimate_number,
          person_id,
          opportunity_id,
          project_id,
          status,
          issue_date,
          expiration_date,
          subtotal_amount,
          discount_type,
          discount_value,
          total_amount,
          notes,
          terms_and_conditions,
          scope_of_work,
          cover_sheet_details,
          is_converted_to_project,
          is_converted_to_bov,
          is_initial_invoice_generated,
          blueprint_of_values_id,
          initial_invoice_id,
          created_at,
          updated_at,
          deposit_required,
          deposit_amount,
          deposit_percentage,
          person:person_id (
            id,
            first_name,
            last_name,
            business_name,
            email,
            phone
          ),
          opportunity:opportunity_id (
            id,
            opportunity_name
          ),
          project:project_id (
            id,
            project_name
          )
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!estimate) return null
      // Explicitly cast to EstimateWithDetails to help TypeScript with complex types
      const typedEstimate = estimate as unknown as EstimateWithDetails

      // Get line items
      const { data: lineItems, error: lineItemsError } = await supabase
        .from("estimate_line_items")
        .select(`
          id,
          estimate_id,
          cost_item_id,
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
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", id)
        .order("sort_order")

      if (lineItemsError) throw lineItemsError
      const typedLineItems = lineItems as unknown as EstimateLineItem[]

      // Get payment schedules
      const { data: paymentSchedules, error: paymentSchedulesError } = await supabase
        .from("estimate_payment_schedules")
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .eq("estimate_id", id)
        .order("sort_order")

      if (paymentSchedulesError) throw paymentSchedulesError
      const typedPaymentSchedules = paymentSchedules as unknown as EstimatePaymentSchedule[]

      // Format the person name
      const personName =
        typedEstimate.person.business_name || `${typedEstimate.person.first_name || ""} ${typedEstimate.person.last_name || ""}`.trim()

      return {
        ...typedEstimate,
        person: {
          ...typedEstimate.person,
          name: personName,
        },
        lineItems: typedLineItems || [],
        paymentSchedules: typedPaymentSchedules || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createEstimate(
    estimate: NewEstimate,
    lineItems: NewEstimateLineItem[] = [],
    paymentSchedules: NewEstimatePaymentSchedule[] = [],
  ): Promise<Estimate> {
    try {
      // Calculate subtotal from line items
      const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

      // Calculate total with discount
      let totalAmount = subtotal
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotal * (1 - estimate.discount_value / 100)
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotal - estimate.discount_value
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount)

      // Start a transaction
      const { data, error } = await supabase
        .from("estimates")
        .insert({
          ...estimate,
          subtotal_amount: subtotal,
          total_amount: totalAmount,
          project_id: estimate.project_id ?? null,
          is_converted_to_project: estimate.is_converted_to_project ?? false,
          is_converted_to_bov: estimate.is_converted_to_bov ?? false,
          is_initial_invoice_generated: estimate.is_initial_invoice_generated ?? false,
          blueprint_of_values_id: estimate.blueprint_of_values_id ?? null,
          initial_invoice_id: estimate.initial_invoice_id ?? null,
        } as any) // Cast to any to bypass strict type checking
        .select(`
          id,
          estimate_number,
          person_id,
          opportunity_id,
          project_id,
          status,
          issue_date,
          expiration_date,
          subtotal_amount,
          discount_type,
          discount_value,
          total_amount,
          notes,
          terms_and_conditions,
          scope_of_work,
          cover_sheet_details,
          is_converted_to_project,
          is_converted_to_bov,
          is_initial_invoice_generated,
          blueprint_of_values_id,
          initial_invoice_id,
          created_at,
          updated_at,
          deposit_required,
          deposit_amount,
          deposit_percentage
        `)
        .single()

      if (error) throw error
      const typedData = data as unknown as Estimate

      // If we have line items, add them
      if (lineItems.length > 0) {
        const itemsWithEstimateId = lineItems.map((item, index) => ({
          ...item,
          estimate_id: typedData.id,
          sort_order: index,
        }))

        const { error: lineItemsError } = await supabase.from("estimate_line_items").insert(itemsWithEstimateId as any) // Cast to any

        if (lineItemsError) throw lineItemsError
      }

      // If we have payment schedules, add them
      if (paymentSchedules.length > 0) {
        const schedulesWithEstimateId = paymentSchedules.map((schedule, index) => ({
          ...schedule,
          estimate_id: typedData.id,
          sort_order: index,
          due_type: schedule.due_type ?? null, // Ensure due_type is string or null, not undefined
          percentage: schedule.percentage ?? null, // Ensure percentage is number or null, not undefined
        }))

        const { error: schedulesError } = await supabase
          .from("estimate_payment_schedules")
          .insert(schedulesWithEstimateId as any) // Cast to any to bypass strict type checking for now

        if (schedulesError) throw schedulesError
      }

      return typedData
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateEstimate(
    id: string,
    updates: UpdateEstimate,
    lineItems?: NewEstimateLineItem[],
    paymentSchedules?: NewEstimatePaymentSchedule[],
  ): Promise<Estimate> {
    try {
      // Fetch the current estimate to compare status
      const currentEstimate = await this.getEstimateById(id);
      if (!currentEstimate) {
        throw new Error(`Estimate with ID ${id} not found.`);
      }
      const oldStatus = currentEstimate.status;

      // If line items are provided, recalculate subtotal and total
      if (lineItems) {
        const subtotal = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)

        // Calculate total with discount
        let totalAmount = subtotal
        if (updates.discount_type === "percentage" && updates.discount_value) {
          totalAmount = subtotal * (1 - updates.discount_value / 100)
        } else if (updates.discount_type === "fixed" && updates.discount_value) {
          totalAmount = subtotal - updates.discount_value
        }

        // Ensure total is not negative
        totalAmount = Math.max(0, totalAmount)

        updates = {
          ...updates,
          subtotal_amount: subtotal,
          total_amount: totalAmount,
        }
      }

      const { data, error } = await supabase
        .from("estimates")
        .update({ ...updates, updated_at: new Date().toISOString() } as any) // Cast to any to bypass strict type checking
        .eq("id", id)
        .select(`
          id,
          estimate_number,
          person_id,
          opportunity_id,
          project_id,
          status,
          issue_date,
          expiration_date,
          subtotal_amount,
          discount_type,
          discount_value,
          total_amount,
          notes,
          terms_and_conditions,
          scope_of_work,
          cover_sheet_details,
          is_converted_to_project,
          is_converted_to_bov,
          is_initial_invoice_generated,
          blueprint_of_values_id,
          initial_invoice_id,
          created_at,
          updated_at,
          deposit_required,
          deposit_amount,
          deposit_percentage
        `)
        .single()

      if (error) throw error
      const typedData = data as unknown as Estimate

      // If line items are provided, replace all existing ones
      if (lineItems) {
        // Delete existing line items
        const { error: deleteError } = await supabase.from("estimate_line_items").delete().eq("estimate_id", id)

        if (deleteError) throw deleteError

        // Insert new line items
        if (lineItems.length > 0) {
          const itemsWithEstimateId = lineItems.map((item, index) => ({
            ...item,
            estimate_id: id,
            sort_order: index,
          }))

          const { error: insertError } = await supabase.from("estimate_line_items").insert(itemsWithEstimateId as any) // Cast to any

          if (insertError) throw insertError
        }
      }

      // If payment schedules are provided, replace all existing ones
      if (paymentSchedules) {
        // Delete existing payment schedules
        const { error: deleteError } = await supabase.from("estimate_payment_schedules").delete().eq("estimate_id", id)

        if (deleteError) throw deleteError

        // Insert new payment schedules
        if (paymentSchedules.length > 0) {
          const schedulesWithEstimateId = paymentSchedules.map((schedule, index) => ({
            ...schedule,
            estimate_id: id,
            sort_order: index,
            due_type: schedule.due_type ?? null, // Ensure due_type is string or null, not undefined
            percentage: schedule.percentage ?? null, // Ensure percentage is number or null, not undefined
          }))

          const { error: insertError } = await supabase
            .from("estimate_payment_schedules")
            .insert(schedulesWithEstimateId as any) // Cast to any to bypass strict type checking for now

          if (insertError) throw insertError
        }
      }

      // Handle estimate acceptance actions if status changed to "Accepted"
      if (oldStatus !== "Accepted" && updates.status === "Accepted") {
        // Assuming userId is available in the context where updateEstimate is called
        // For now, we'll pass null or a placeholder. In a real app, this would come from auth context.
        const currentUserId = updates.updated_by || null; // Use updated_by as a proxy for current user
        await this.handleEstimateAccepted(id, currentUserId);
      }

      return typedData
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteEstimate(id: string): Promise<void> {
    try {
      // Line items and payment schedules will be deleted automatically due to CASCADE constraint
      const { error } = await supabase.from("estimates").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Line item methods
  async getEstimateLineItems(estimateId: string): Promise<EstimateLineItem[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select(`
          id,
          estimate_id,
          cost_item_id,
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
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error
      return (data || []) as unknown as EstimateLineItem[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getLineItemsBySection(estimateId: string): Promise<LineItemsBySection> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .select(`
          id,
          estimate_id,
          cost_item_id,
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
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error
      const typedData = data as unknown as EstimateLineItem[]

      // Group by section
      const sections: LineItemsBySection = {}

      // Default section for items without a section
      const defaultSection = "General"

      if (typedData) {
        typedData.forEach((item) => {
          const sectionName = item.section_name || defaultSection
          if (!sections[sectionName]) {
            sections[sectionName] = []
          }
          sections[sectionName].push(item)
        })
      }

      return sections
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addLineItem(lineItem: NewEstimateLineItem): Promise<EstimateLineItem> {
    try {
      // Get the current highest sort order
      const { data: existingItems, error: countError } = await supabase
        .from("estimate_line_items")
        .select("sort_order")
        .eq("estimate_id", lineItem.estimate_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (countError) throw countError

      const sortOrder = existingItems && existingItems.length > 0 ? existingItems[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from("estimate_line_items")
        .insert({ ...lineItem, sort_order: sortOrder } as any) // Cast to any
        .select(`
          id,
          estimate_id,
          cost_item_id,
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
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .single()

      if (error) throw error

      // Update the estimate total
      await this.updateEstimateTotal(lineItem.estimate_id)

      return data as unknown as EstimateLineItem
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateLineItem(id: string, updates: UpdateEstimateLineItem): Promise<EstimateLineItem> {
    try {
      const { data, error } = await supabase
        .from("estimate_line_items")
        .update({ ...updates, updated_at: new Date().toISOString() } as any) // Cast to any
        .eq("id", id)
        .select(`
          id,
          estimate_id,
          cost_item_id,
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
          assigned_to_user_id,
          created_at,
          updated_at,
          costItem:cost_item_id (
            id,
            item_code,
            name,
            type
          )
        `)
        .single()

      if (error) throw error

      // Update the estimate total
      // Type cast the data to include estimate_id
      const typedData = data as unknown as EstimateLineItem
      if (typedData.estimate_id) {
        await this.updateEstimateTotal(typedData.estimate_id)
      }

      return data as unknown as EstimateLineItem
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteLineItem(id: string): Promise<void> {
    try {
      // Get the estimate_id before deleting
      const { data, error: getError } = await supabase
        .from("estimate_line_items")
        .select("estimate_id")
        .eq("id", id)
        .single()

      if (getError) throw getError
      // @ts-ignore: Supabase type inference issue with SelectQueryError
      const estimateIdToDelete = (data as { estimate_id: string }).estimate_id;

      const { error } = await supabase.from("estimate_line_items").delete().eq("id", id)

      if (error) throw error

      // Update the estimate total
      if (estimateIdToDelete) {
        await this.updateEstimateTotal(estimateIdToDelete)
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateEstimateTotal(estimateId: string): Promise<void> {
    try {
      // Calculate the subtotal from all line items
      const { data: lineItems, error: itemsError } = await supabase
        .from("estimate_line_items")
        .select("total")
        .eq("estimate_id", estimateId)

      if (itemsError) throw itemsError

      const subtotalAmount = lineItems?.reduce((sum, item) => sum + (item.total || 0), 0) || 0

      // Get the current discount settings
      const { data: estimate, error: estimateError } = await supabase
        .from("estimates")
        .select("discount_type, discount_value")
        .eq("id", estimateId)
        .single()

      if (estimateError) throw estimateError

      // Calculate total with discount
      let totalAmount = subtotalAmount
      if (estimate.discount_type === "percentage" && estimate.discount_value) {
        totalAmount = subtotalAmount * (1 - estimate.discount_value / 100)
      } else if (estimate.discount_type === "fixed" && estimate.discount_value) {
        totalAmount = subtotalAmount - estimate.discount_value
      }

      // Ensure total is not negative
      totalAmount = Math.max(0, totalAmount)

      // Update the estimate with the new total
      const { error: updateError } = await supabase
        .from("estimates")
        .update({
          subtotal_amount: subtotalAmount,
          total_amount: totalAmount,
          updated_at: new Date().toISOString(),
        })
        .eq("id", estimateId)

      if (updateError) throw updateError
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Payment schedule methods
  async getPaymentSchedules(estimateId: string): Promise<EstimatePaymentSchedule[]> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .eq("estimate_id", estimateId)
        .order("sort_order")

      if (error) throw error
      return (data || []) as unknown as EstimatePaymentSchedule[]
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addPaymentSchedule(schedule: NewEstimatePaymentSchedule): Promise<EstimatePaymentSchedule> {
    try {
      // Get the current highest sort order
      const { data: existingSchedules, error: countError } = await supabase
        .from("estimate_payment_schedules")
        .select("sort_order")
        .eq("estimate_id", schedule.estimate_id)
        .order("sort_order", { ascending: false })
        .limit(1)

      if (countError) throw countError

      const sortOrder = existingSchedules && existingSchedules.length > 0 ? existingSchedules[0].sort_order + 1 : 0

      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .insert({ ...schedule, sort_order: sortOrder } as any) // Cast to any
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .single()

      if (error) throw error
      return data as unknown as EstimatePaymentSchedule
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePaymentSchedule(id: string, updates: UpdateEstimatePaymentSchedule): Promise<EstimatePaymentSchedule> {
    try {
      const { data, error } = await supabase
        .from("estimate_payment_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() } as any) // Cast to any
        .eq("id", id)
        .select(`
          id,
          estimate_id,
          description,
          amount,
          due_type,
          due_date,
          sort_order,
          created_at,
          updated_at
        `)
        .single()

      if (error) throw error
      return data as unknown as EstimatePaymentSchedule
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deletePaymentSchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("estimate_payment_schedules").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper to generate a unique estimate number
  async generateEstimateNumber(): Promise<string> {
    const prefix = "EST"
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    // Get the latest estimate number with this prefix
    const { data, error } = await supabase
      .from("estimates")
      .select("estimate_number")
      .ilike("estimate_number", `${prefix}${year}${month}%`)
      .order("estimate_number", { ascending: false })
      .limit(1)

    if (error) throw error

    let sequence = 1
    if (data && data.length > 0 && data[0].estimate_number) {
      // Extract the sequence number from the latest estimate number
      const latestSequence = Number.parseInt(data[0].estimate_number.slice(-4), 10)
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1
      }
    }

    return `${prefix}${year}${month}${sequence.toString().padStart(4, "0")}`
  },
}
