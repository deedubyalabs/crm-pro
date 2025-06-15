"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CostItemForm } from "../cost-item-form"
import { createCostItemAction } from "../actions"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import type { CostItem } from "@/types/cost-items"

interface CreateCostItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onCostItemCreated?: (costItem: CostItem) => void // Callback to notify parent
}

export function CreateCostItemDialog({ isOpen, onClose, onCostItemCreated }: CreateCostItemDialogProps) {
  const router = useRouter()

  const handleSubmit = async (values: any) => {
    try {
      const createdItem = await createCostItemAction(values) // Directly get the created CostItem
      toast({
        title: "Cost Item Created",
        description: "The new cost item has been successfully added.",
      })
      onClose() // Close the dialog on success
      if (onCostItemCreated && createdItem) {
        onCostItemCreated(createdItem) // Notify parent with the full cost item
      }
      // Optionally, revalidate path or refresh data in the parent component
      // router.refresh() // This might be too broad, consider more targeted revalidation
    } catch (error) {
      console.error("Error creating cost item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create cost item.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Cost Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new cost item.
          </DialogDescription>
        </DialogHeader>
        <CostItemForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  )
}
