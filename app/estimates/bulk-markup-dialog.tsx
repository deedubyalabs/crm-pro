"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

interface BulkMarkupDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyMarkup: (markupPercentage: number, scope: string) => void
}

export function BulkMarkupDialog({ isOpen, onClose, onApplyMarkup }: BulkMarkupDialogProps) {
  const [markupPercentage, setMarkupPercentage] = useState(0)
  const [scope, setScope] = useState("all") // "all", "material", "labor", etc.
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleApply = async () => {
    setIsSubmitting(true)
    try {
      if (markupPercentage < 0) {
        throw new Error("Markup percentage cannot be negative.")
      }
      onApplyMarkup(markupPercentage, scope)
      onClose()
    } catch (error) {
      toast({
        title: "Error Applying Markup",
        description: error instanceof Error ? error.message : "Failed to apply bulk markup.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply Bulk Markup</DialogTitle>
          <DialogDescription>
            Apply a markup percentage to multiple line items.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="markup-percentage" className="text-right">
              Markup (%)
            </Label>
            <Input
              id="markup-percentage"
              type="number"
              step="0.01"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(parseFloat(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="scope" className="text-right">
              Apply To
            </Label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Items</SelectItem>
                <SelectItem value="material">Material Items</SelectItem>
                <SelectItem value="labor">Labor Items</SelectItem>
                <SelectItem value="equipment">Equipment Items</SelectItem>
                <SelectItem value="subcontractor">Subcontractor Items</SelectItem>
                <SelectItem value="other">Other Items</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleApply} disabled={isSubmitting}>
            {isSubmitting ? "Applying..." : "Apply Markup"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
