"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"
import type { InvoiceLineItem } from "@/types/invoices"

interface InvoiceLineItemProps {
  lineItem: Partial<InvoiceLineItem>
  onChange: (updatedLineItem: Partial<InvoiceLineItem>) => void
  onRemove: () => void
  index: number
}

export default function InvoiceLineItemComponent({ lineItem, onChange, onRemove, index }: InvoiceLineItemProps) {
  const [quantity, setQuantity] = useState<number>(lineItem.quantity || 0)
  const [unitPrice, setUnitPrice] = useState<number>(lineItem.unit_price || 0)
  const [total, setTotal] = useState<number>(lineItem.total || 0)

  // Calculate total when quantity or unit price changes
  useEffect(() => {
    const calculatedTotal = quantity * unitPrice
    setTotal(calculatedTotal)

    onChange({
      ...lineItem,
      quantity,
      unit_price: unitPrice,
      total: calculatedTotal,
    })
  }, [quantity, unitPrice])

  return (
    <div className="grid grid-cols-12 gap-2 items-center mb-2">
      <div className="col-span-5 sm:col-span-6">
        <Input
          placeholder="Description"
          value={lineItem.description || ""}
          onChange={(e) => onChange({ ...lineItem, description: e.target.value })}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Qty"
          value={quantity || ""}
          onChange={(e) => setQuantity(Number.parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-2">
        <Input
          placeholder="Unit"
          value={lineItem.unit || ""}
          onChange={(e) => onChange({ ...lineItem, unit: e.target.value })}
        />
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          placeholder="Price"
          value={unitPrice || ""}
          onChange={(e) => setUnitPrice(Number.parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="col-span-2 sm:col-span-1 flex items-center">
        <span className="w-full text-right pr-2">${total.toFixed(2)}</span>
      </div>
      <div className="col-span-1 flex justify-end">
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove item {index + 1}</span>
        </Button>
      </div>
    </div>
  )
}
