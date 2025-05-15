"use client"

import { CostItemForm } from "../cost-item-form"
import { createCostItemAction } from "../actions" // Import the Server Action

export default function NewCostItemClientPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">New Cost Item</h1>
      <CostItemForm onSubmit={createCostItemAction} /> {/* Pass the Server Action */}
    </div>
  )
}
