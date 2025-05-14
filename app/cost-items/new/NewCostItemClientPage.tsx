"use client"

import { redirect } from "next/navigation"
import { CostItemForm } from "../cost-item-form"
import { costItemService } from "@/lib/cost-items"
import type { NewCostItem } from "@/types/cost-items"

export default function NewCostItemClientPage() {
  async function onSubmit(values: NewCostItem) {
    "use server"

    try {
      await costItemService.createCostItem(values)
      redirect("/cost-items")
    } catch (error) {
      console.error("Error creating cost item:", error)
      throw error
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">New Cost Item</h1>
      <CostItemForm onSubmit={onSubmit} />
    </div>
  )
}
