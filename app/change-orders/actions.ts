"use server"

import { createChangeOrder, updateChangeOrder } from "@/lib/change-orders"

export async function handleCreateChangeOrder(formData: FormData) {
  // Extract form data
  const project_id = formData.get("project_id") as string
  const person_id = formData.get("person_id") as string
  const co_number = formData.get("co_number") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string
  const reason = formData.get("reason") as string
  const time_impact_days = Number.parseInt(formData.get("time_impact_days") as string) || 0
  const lineItemsJson = formData.get("lineItems") as string
  const cost_impact = Number.parseFloat(formData.get("cost_impact") as string) || 0

  const line_items = JSON.parse(lineItemsJson)

  await createChangeOrder({
    project_id,
    person_id,
    co_number,
    status: status || "Requested",
    description,
    reason,
    cost_impact,
    time_impact_days,
    line_items: line_items.map((item: any) => ({
      description: item.description || "",
      quantity: item.quantity || 0,
      unit: item.unit || "each",
      unit_cost: item.unit_cost || 0,
      markup: item.markup || 0,
      total: item.total || 0,
      sort_order: item.sort_order || 0,
    })),
  })

  return { success: true }
}

export async function handleUpdateChangeOrder(id: string, formData: FormData) {
  // Extract form data
  const project_id = formData.get("project_id") as string
  const person_id = formData.get("person_id") as string
  const co_number = formData.get("co_number") as string
  const status = formData.get("status") as string
  const description = formData.get("description") as string
  const reason = formData.get("reason") as string
  const time_impact_days = Number.parseInt(formData.get("time_impact_days") as string) || 0
  const lineItemsJson = formData.get("lineItems") as string
  const cost_impact = Number.parseFloat(formData.get("cost_impact") as string) || 0

  const line_items = JSON.parse(lineItemsJson)

  await updateChangeOrder(id, {
    project_id,
    person_id,
    co_number,
    status: status || "Requested",
    description,
    reason,
    cost_impact,
    time_impact_days,
    line_items: line_items.map((item: any) => ({
      id: item.id,
      description: item.description || "",
      quantity: item.quantity || 0,
      unit: item.unit || "each",
      unit_cost: item.unit_cost || 0,
      markup: item.markup || 0,
      total: item.total || 0,
      sort_order: item.sort_order || 0,
    })),
  })

  return { success: true }
}
