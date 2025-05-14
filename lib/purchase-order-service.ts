import { supabase, handleSupabaseError } from "./supabase"
import type {
  PurchaseOrder,
  NewPurchaseOrder,
  UpdatePurchaseOrder,
  PurchaseOrderItem,
  NewPurchaseOrderItem,
  UpdatePurchaseOrderItem,
  DeliverySchedule,
  NewDeliverySchedule,
  UpdateDeliverySchedule,
  PurchaseOrderWithDetails,
  PurchaseOrderFilters,
} from "@/types/purchase-orders"
import type { MaterialListItem } from "@/types/material-lists"

export const purchaseOrderService = {
  async getPurchaseOrders(filters?: PurchaseOrderFilters): Promise<PurchaseOrder[]> {
    try {
      let query = supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:supplier_id (
            id,
            name
          ),
          project:project_id (
            id,
            project_name
          )
        `)
        .order("created_at", { ascending: false })

      // Apply filters
      if (filters?.projectId) {
        query = query.eq("project_id", filters.projectId)
      }

      if (filters?.supplierId) {
        query = query.eq("supplier_id", filters.supplierId)
      }

      if (filters?.status) {
        query = query.eq("status", filters.status)
      }

      if (filters?.search) {
        query = query.or(`po_number.ilike.%${filters.search}%,notes.ilike.%${filters.search}%`)
      }

      if (filters?.startDate) {
        query = query.gte("issue_date", filters.startDate)
      }

      if (filters?.endDate) {
        query = query.lte("issue_date", filters.endDate)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async getPurchaseOrderById(id: string): Promise<PurchaseOrderWithDetails | null> {
    try {
      const { data: purchaseOrder, error } = await supabase
        .from("purchase_orders")
        .select(`
          *,
          supplier:supplier_id (*),
          project:project_id (*)
        `)
        .eq("id", id)
        .single()

      if (error) throw error
      if (!purchaseOrder) return null

      // Get purchase order items
      const { data: items, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select(`
          *,
          materialListItem:material_list_item_id (*)
        `)
        .eq("purchase_order_id", id)
        .order("created_at")

      if (itemsError) throw itemsError

      // Get delivery schedules
      const { data: deliveries, error: deliveriesError } = await supabase
        .from("delivery_schedules")
        .select("*")
        .eq("purchase_order_id", id)
        .order("scheduled_date")

      if (deliveriesError) throw deliveriesError

      return {
        ...purchaseOrder,
        items: items || [],
        deliveries: deliveries || [],
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async createPurchaseOrder(purchaseOrder: NewPurchaseOrder): Promise<PurchaseOrder> {
    try {
      // Generate PO number if not provided
      if (!purchaseOrder.po_number) {
        purchaseOrder.po_number = await this.generatePONumber()
      }

      const { data, error } = await supabase.from("purchase_orders").insert(purchaseOrder).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePurchaseOrder(id: string, updates: UpdatePurchaseOrder): Promise<PurchaseOrder> {
    try {
      const { data, error } = await supabase
        .from("purchase_orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deletePurchaseOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("purchase_orders").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Purchase order items methods
  async getPurchaseOrderItems(purchaseOrderId: string): Promise<PurchaseOrderItem[]> {
    try {
      const { data, error } = await supabase
        .from("purchase_order_items")
        .select(`
          *,
          materialListItem:material_list_item_id (*)
        `)
        .eq("purchase_order_id", purchaseOrderId)
        .order("created_at")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addPurchaseOrderItem(item: NewPurchaseOrderItem): Promise<PurchaseOrderItem> {
    try {
      const { data, error } = await supabase.from("purchase_order_items").insert(item).select().single()

      if (error) throw error

      // Update purchase order totals
      await this.updatePurchaseOrderTotals(item.purchase_order_id)

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updatePurchaseOrderItem(id: string, updates: UpdatePurchaseOrderItem): Promise<PurchaseOrderItem> {
    try {
      const { data, error } = await supabase
        .from("purchase_order_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      // Update purchase order totals
      if (data.purchase_order_id) {
        await this.updatePurchaseOrderTotals(data.purchase_order_id)
      }

      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deletePurchaseOrderItem(id: string): Promise<void> {
    try {
      // Get the purchase_order_id before deleting
      const { data: item, error: getError } = await supabase
        .from("purchase_order_items")
        .select("purchase_order_id")
        .eq("id", id)
        .single()

      if (getError) throw getError

      const { error } = await supabase.from("purchase_order_items").delete().eq("id", id)

      if (error) throw error

      // Update purchase order totals
      if (item && item.purchase_order_id) {
        await this.updatePurchaseOrderTotals(item.purchase_order_id)
      }
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Delivery schedule methods
  async getDeliverySchedules(purchaseOrderId: string): Promise<DeliverySchedule[]> {
    try {
      const { data, error } = await supabase
        .from("delivery_schedules")
        .select("*")
        .eq("purchase_order_id", purchaseOrderId)
        .order("scheduled_date")

      if (error) throw error
      return data || []
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async addDeliverySchedule(schedule: NewDeliverySchedule): Promise<DeliverySchedule> {
    try {
      const { data, error } = await supabase.from("delivery_schedules").insert(schedule).select().single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async updateDeliverySchedule(id: string, updates: UpdateDeliverySchedule): Promise<DeliverySchedule> {
    try {
      const { data, error } = await supabase
        .from("delivery_schedules")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  async deleteDeliverySchedule(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("delivery_schedules").delete().eq("id", id)

      if (error) throw error
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Helper methods
  async updatePurchaseOrderTotals(purchaseOrderId: string): Promise<void> {
    try {
      // Get all items for this purchase order
      const { data: items, error: itemsError } = await supabase
        .from("purchase_order_items")
        .select("total_cost")
        .eq("purchase_order_id", purchaseOrderId)

      if (itemsError) throw itemsError

      // Calculate subtotal
      const subtotal = items?.reduce((sum, item) => sum + (item.total_cost || 0), 0) || 0

      // Get the current tax rate from the purchase order
      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .select("tax_amount, subtotal_amount")
        .eq("id", purchaseOrderId)
        .single()

      if (poError) throw poError

      // Calculate tax amount (preserve tax rate if subtotal has changed)
      let taxAmount = po.tax_amount || 0
      if (po.subtotal_amount && po.subtotal_amount > 0) {
        const taxRate = po.tax_amount / po.subtotal_amount
        taxAmount = subtotal * taxRate
      }

      // Calculate total
      const total = subtotal + taxAmount

      // Update the purchase order
      const { error: updateError } = await supabase
        .from("purchase_orders")
        .update({
          subtotal_amount: subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          updated_at: new Date().toISOString(),
        })
        .eq("id", purchaseOrderId)

      if (updateError) throw updateError
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },

  // Generate a unique PO number
  async generatePONumber(): Promise<string> {
    const prefix = "PO"
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")

    // Get the latest PO number with this prefix
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("po_number")
      .ilike("po_number", `${prefix}${year}${month}%`)
      .order("po_number", { ascending: false })
      .limit(1)

    if (error) throw error

    let sequence = 1
    if (data && data.length > 0 && data[0].po_number) {
      // Extract the sequence number from the latest PO number
      const latestSequence = Number.parseInt(data[0].po_number.slice(-4), 10)
      if (!isNaN(latestSequence)) {
        sequence = latestSequence + 1
      }
    }

    return `${prefix}${year}${month}${sequence.toString().padStart(4, "0")}`
  },

  // Generate purchase orders from material list
  async generateFromMaterialList(
    materialListId: string,
    options: {
      groupBySupplier?: boolean
      deliveryDate?: string
    } = {},
  ): Promise<PurchaseOrder[]> {
    try {
      // Get the material list with items
      const { data: materialList, error: listError } = await supabase
        .from("material_lists")
        .select(`
          *,
          project:project_id (*)
        `)
        .eq("id", materialListId)
        .single()

      if (listError) throw listError

      // Get all material list items
      const { data: items, error: itemsError } = await supabase
        .from("material_list_items")
        .select(`
          *,
          supplier:supplier_id (*)
        `)
        .eq("material_list_id", materialListId)

      if (itemsError) throw itemsError
      if (!items || items.length === 0) {
        throw new Error("No items found in material list")
      }

      const createdPOs: PurchaseOrder[] = []

      if (options.groupBySupplier) {
        // Group items by supplier
        const itemsBySupplier: Record<string, MaterialListItem[]> = {}

        // Handle items without suppliers
        const unassignedItems: MaterialListItem[] = []

        items.forEach((item) => {
          if (item.supplier_id) {
            if (!itemsBySupplier[item.supplier_id]) {
              itemsBySupplier[item.supplier_id] = []
            }
            itemsBySupplier[item.supplier_id].push(item)
          } else {
            unassignedItems.push(item)
          }
        })

        // Create a PO for each supplier
        for (const [supplierId, supplierItems] of Object.entries(itemsBySupplier)) {
          if (supplierItems.length === 0) continue

          // Create the purchase order
          const newPO: NewPurchaseOrder = {
            project_id: materialList.project_id,
            material_list_id: materialListId,
            supplier_id: supplierId,
            status: "draft",
            issue_date: new Date().toISOString(),
            delivery_date: options.deliveryDate,
            subtotal_amount: 0,
            tax_amount: 0,
            total_amount: 0,
            notes: `Generated from material list: ${materialList.name}`,
          }

          // If project has an address, use it for shipping
          if (materialList.project) {
            newPO.shipping_address_line1 = materialList.project.project_address_line1 || undefined
            newPO.shipping_address_line2 = materialList.project.project_address_line2 || undefined
            newPO.shipping_city = materialList.project.project_city || undefined
            newPO.shipping_state_province = materialList.project.project_state_province || undefined
            newPO.shipping_postal_code = materialList.project.project_postal_code || undefined
            newPO.shipping_country = materialList.project.project_country || undefined
          }

          const po = await this.createPurchaseOrder(newPO)
          createdPOs.push(po)

          // Add items to the PO
          const poItems: NewPurchaseOrderItem[] = supplierItems.map((item) => ({
            purchase_order_id: po.id,
            material_list_item_id: item.id,
            cost_item_id: item.cost_item_id || undefined,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_cost: item.unit_cost || 0,
            total_cost: item.total_cost || (item.unit_cost || 0) * item.quantity,
          }))

          if (poItems.length > 0) {
            const { error: insertError } = await supabase.from("purchase_order_items").insert(poItems)

            if (insertError) throw insertError

            // Update the PO totals
            await this.updatePurchaseOrderTotals(po.id)

            // Update material list items status
            const { error: updateError } = await supabase
              .from("material_list_items")
              .update({ status: "ordered", updated_at: new Date().toISOString() })
              .in(
                "id",
                supplierItems.map((item) => item.id),
              )

            if (updateError) throw updateError
          }
        }

        // Handle unassigned items if there are any
        if (unassignedItems.length > 0) {
          // Create a PO for unassigned items
          const newPO: NewPurchaseOrder = {
            project_id: materialList.project_id,
            material_list_id: materialListId,
            status: "draft",
            issue_date: new Date().toISOString(),
            delivery_date: options.deliveryDate,
            subtotal_amount: 0,
            tax_amount: 0,
            total_amount: 0,
            notes: `Generated from material list: ${materialList.name} (Unassigned items)`,
          }

          // If project has an address, use it for shipping
          if (materialList.project) {
            newPO.shipping_address_line1 = materialList.project.project_address_line1 || undefined
            newPO.shipping_address_line2 = materialList.project.project_address_line2 || undefined
            newPO.shipping_city = materialList.project.project_city || undefined
            newPO.shipping_state_province = materialList.project.project_state_province || undefined
            newPO.shipping_postal_code = materialList.project.project_postal_code || undefined
            newPO.shipping_country = materialList.project.project_country || undefined
          }

          const po = await this.createPurchaseOrder(newPO)
          createdPOs.push(po)

          // Add items to the PO
          const poItems: NewPurchaseOrderItem[] = unassignedItems.map((item) => ({
            purchase_order_id: po.id,
            material_list_item_id: item.id,
            cost_item_id: item.cost_item_id || undefined,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            unit_cost: item.unit_cost || 0,
            total_cost: item.total_cost || (item.unit_cost || 0) * item.quantity,
          }))

          if (poItems.length > 0) {
            const { error: insertError } = await supabase.from("purchase_order_items").insert(poItems)

            if (insertError) throw insertError

            // Update the PO totals
            await this.updatePurchaseOrderTotals(po.id)

            // Update material list items status
            const { error: updateError } = await supabase
              .from("material_list_items")
              .update({ status: "ordered", updated_at: new Date().toISOString() })
              .in(
                "id",
                unassignedItems.map((item) => item.id),
              )

            if (updateError) throw updateError
          }
        }
      } else {
        // Create a single PO for all items
        const newPO: NewPurchaseOrder = {
          project_id: materialList.project_id,
          material_list_id: materialListId,
          status: "draft",
          issue_date: new Date().toISOString(),
          delivery_date: options.deliveryDate,
          subtotal_amount: 0,
          tax_amount: 0,
          total_amount: 0,
          notes: `Generated from material list: ${materialList.name}`,
        }

        // If project has an address, use it for shipping
        if (materialList.project) {
          newPO.shipping_address_line1 = materialList.project.project_address_line1 || undefined
          newPO.shipping_address_line2 = materialList.project.project_address_line2 || undefined
          newPO.shipping_city = materialList.project.project_city || undefined
          newPO.shipping_state_province = materialList.project.project_state_province || undefined
          newPO.shipping_postal_code = materialList.project.project_postal_code || undefined
          newPO.shipping_country = materialList.project.project_country || undefined
        }

        const po = await this.createPurchaseOrder(newPO)
        createdPOs.push(po)

        // Add items to the PO
        const poItems: NewPurchaseOrderItem[] = items.map((item) => ({
          purchase_order_id: po.id,
          material_list_item_id: item.id,
          cost_item_id: item.cost_item_id || undefined,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost || 0,
          total_cost: item.total_cost || (item.unit_cost || 0) * item.quantity,
        }))

        if (poItems.length > 0) {
          const { error: insertError } = await supabase.from("purchase_order_items").insert(poItems)

          if (insertError) throw insertError

          // Update the PO totals
          await this.updatePurchaseOrderTotals(po.id)

          // Update material list items status
          const { error: updateError } = await supabase
            .from("material_list_items")
            .update({ status: "ordered", updated_at: new Date().toISOString() })
            .in(
              "id",
              items.map((item) => item.id),
            )

          if (updateError) throw updateError
        }
      }

      // Update material list status
      await supabase
        .from("material_lists")
        .update({
          status: "ordered",
          updated_at: new Date().toISOString(),
        })
        .eq("id", materialListId)

      return createdPOs
    } catch (error) {
      throw new Error(handleSupabaseError(error))
    }
  },
}
