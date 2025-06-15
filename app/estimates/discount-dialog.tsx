"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Percent, DollarSign } from "lucide-react"
import type { DiscountType } from "@/types/estimates"

interface DiscountDialogProps {
  isOpen: boolean
  onClose: () => void
  onApplyDiscount: (type: DiscountType, value: number) => void
  initialDiscountType: DiscountType
  initialDiscountValue: number
}

export function DiscountDialog({
  isOpen,
  onClose,
  onApplyDiscount,
  initialDiscountType,
  initialDiscountValue,
}: DiscountDialogProps) {
  const [discountType, setDiscountType] = useState<DiscountType>(initialDiscountType)
  const [discountValue, setDiscountValue] = useState<string>(initialDiscountValue.toString())

  useEffect(() => {
    setDiscountType(initialDiscountType)
    setDiscountValue(initialDiscountValue.toString())
  }, [initialDiscountType, initialDiscountValue])

  const handleApply = () => {
    const value = parseFloat(discountValue) || 0
    onApplyDiscount(discountType, value)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Apply Discount</DialogTitle>
          <DialogDescription>
            Apply a percentage or fixed amount discount to the estimate.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountType" className="text-right">
              Type
            </Label>
            <Select
              value={discountType || ""}
              onValueChange={(value: DiscountType) => setDiscountType(value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  <div className="flex items-center">
                    <Percent className="mr-2 h-4 w-4" />
                    Percentage
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Fixed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountValue" className="text-right">
              Value
            </Label>
            <Input
              id="discountValue"
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="col-span-3"
              disabled={!discountType}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Discount</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
