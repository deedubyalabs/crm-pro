"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash, Sparkles } from "lucide-react" // Added Sparkles icon
import { formatCurrency } from "@/lib/utils"
import type { CostItem } from "@/types/cost-items"
import type { EstimateLineItem } from "@/types/estimates"
import { cn } from "@/lib/utils" // Import cn for conditional classes

interface EstimateLineItemProps {
  lineItem: Partial<EstimateLineItem>
  costItems: CostItem[]
  sections: string[]
  onUpdate: (updatedLineItem: Partial<EstimateLineItem>) => void
  onDelete: () => void
  isNew?: boolean
  isAISuggested?: boolean // Added isAISuggested prop
}

export function EstimateLineItemRow({
  lineItem,
  costItems,
  sections,
  onUpdate,
  onDelete,
  isNew = false,
  isAISuggested = false, // Default to false
}: EstimateLineItemProps) {
  const [quantity, setQuantity] = useState(lineItem.quantity?.toString() || "1")
  const [unitCost, setUnitCost] = useState(lineItem.unit_cost?.toString() || "0")
  const [markup, setMarkup] = useState(lineItem.markup?.toString() || "0")
  const [total, setTotal] = useState(lineItem.total || 0)
  const [selectedCostItemId, setSelectedCostItemId] = useState(lineItem.cost_item_id || "")
  const [description, setDescription] = useState(lineItem.description || "")
  const [unit, setUnit] = useState(lineItem.unit || "EA")
  const [section, setSection] = useState(lineItem.section_name || "")
  const [notes, setNotes] = useState(lineItem.notes || "") // State for notes

  // Calculate total when quantity, unit cost, or markup changes
  useEffect(() => {
    const qty = Number.parseFloat(quantity) || 0
    const cost = Number.parseFloat(unitCost) || 0
    const mkp = Number.parseFloat(markup) || 0

    const subtotal = qty * cost
    const markupAmount = subtotal * (mkp / 100)
    const newTotal = subtotal + markupAmount

    setTotal(newTotal)

    onUpdate({
      ...lineItem,
      quantity: qty,
      unit_cost: cost,
      markup: mkp,
      total: newTotal,
      description,
      unit,
      cost_item_id: selectedCostItemId || null,
      section_name: section || null,
      notes, // Include notes in the update
    })
  }, [quantity, unitCost, markup, description, unit, selectedCostItemId, section, notes]) // Added notes to dependencies

  // Handle cost item selection
  const handleCostItemChange = (costItemId: string) => {
    setSelectedCostItemId(costItemId)

    if (costItemId && costItemId !== "custom") {
      const selectedItem = costItems.find((item) => item.id === costItemId)
      if (selectedItem) {
        setDescription(selectedItem.name)
        setUnit(selectedItem.unit)
        setUnitCost(selectedItem.unit_cost.toString())
        setMarkup(selectedItem.default_markup.toString())
        // Do not overwrite notes from AI if a cost item is selected
        // setNotes(selectedItem.description || ""); // Decide if cost item description should overwrite AI notes
      }
    }
  }

  return (
    <div className={cn("grid grid-cols-12 gap-2 items-center mb-2 p-2 rounded-md", isAISuggested && "bg-blue-50/50")}> {/* Added conditional background */}
      <div className="col-span-4">
        <div className="space-y-2">
           {isAISuggested && ( // Display AI badge if suggested by AI
              <div className="flex items-center text-xs text-blue-600 font-medium">
                <Sparkles className="mr-1 h-3 w-3 fill-blue-600" /> AI Suggestion
              </div>
            )}
          <Select value={selectedCostItemId} onValueChange={handleCostItemChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select item or enter custom" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Custom Item</SelectItem>
              {costItems.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.item_code} - {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={section} onValueChange={setSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select section or leave blank" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((sectionName) => (
                sectionName !== "" && ( // Add check for empty string
                  <SelectItem key={sectionName} value={sectionName}>
                    {sectionName}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[60px]"
          />
           {notes && ( // Display notes if they exist
            <Textarea
              placeholder="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[40px] text-xs text-muted-foreground"
              readOnly // Make notes read-only for now, can make editable later if needed
            />
          )}
        </div>
      </div>
      <div className="col-span-1">
        <Input type="number" min="0" step="0.01" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </div>
      <div className="col-span-1">
        <Select value={unit} onValueChange={setUnit}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EA">EA</SelectItem>
            <SelectItem value="HR">HR</SelectItem>
            <SelectItem value="DAY">DAY</SelectItem>
            <SelectItem value="FT">FT</SelectItem>
            <SelectItem value="SQ FT">SQ FT</SelectItem>
            <SelectItem value="LF">LF</SelectItem>
            <SelectItem value="BOX">BOX</SelectItem>
            <SelectItem value="ROLL">ROLL</SelectItem>
            <SelectItem value="GAL">GAL</SelectItem>
            <SelectItem value="LB">LB</SelectItem>
            <SelectItem value="SET">SET</SelectItem>
            <SelectItem value="LOT">LOT</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
          className="text-right"
        />
      </div>
      <div className="col-span-1">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
          className="text-right"
        />
      </div>
      <div className="col-span-2 text-right font-medium">{formatCurrency(total)}</div>
      <div className="col-span-1 text-right">
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  )
}
