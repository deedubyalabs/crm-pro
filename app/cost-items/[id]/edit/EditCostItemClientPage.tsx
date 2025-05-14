"use client"

import { notFound, redirect } from "next/navigation"
import { CostItemForm } from "../../cost-item-form"
import { costItemService } from "@/lib/cost-items"
import type { UpdateCostItem } from "@/types/cost-items"
import { useEffect, useState } from "react"

interface EditCostItemClientPageProps {
  id: string
}

export default function EditCostItemClientPage({ id }: EditCostItemClientPageProps) {
  const [costItem, setCostItem] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCostItem() {
      try {
        const fetchedCostItem = await costItemService.getCostItemById(id)
        if (!fetchedCostItem) {
          notFound()
          return
        }
        setCostItem(fetchedCostItem)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCostItem()
  }, [id])

  async function onSubmit(values: UpdateCostItem) {
    try {
      await costItemService.updateCostItem(id, values)
      redirect("/cost-items")
    } catch (error) {
      console.error("Error updating cost item:", error)
      throw error
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Edit Cost Item</h1>
      <CostItemForm costItem={costItem} onSubmit={onSubmit} />
    </div>
  )
}
