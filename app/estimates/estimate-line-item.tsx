"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash, Sparkles, Search } from "lucide-react" // Import Search icon
import { formatCurrency } from "@/lib/utils"
import type { CostItem } from "@/types/cost-items"
import type { EstimateLineItem } from "@/types/estimates"
import type { User } from "@/types/auth"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet" // Import Sheet components
import { CostItemSelectorDrawer } from "./cost-item-selector-drawer" // Import the new drawer component

interface EstimateLineItemProps {
  lineItem: Partial<EstimateLineItem>
  costItems: CostItem[]
  sections: string[]
  onUpdate: (updatedLineItem: Partial<EstimateLineItem>) => void
  onDelete: () => void
  isNew?: boolean
  isAISuggested?: boolean
}

export function EstimateLineItemRow({
  lineItem,
  costItems,
  sections,
  onUpdate,
  onDelete,
  isNew = false,
  isAISuggested = false,
}: EstimateLineItemProps) {
  const [quantity, setQuantity] = useState(lineItem.quantity?.toString() || "1")
  const [unitCost, setUnitCost] = useState(lineItem.unit_cost?.toString() || "0")
  const [markup, setMarkup] = useState(lineItem.markup?.toString() || "0")
  const [total, setTotal] = useState(lineItem.total || 0)
  const [selectedCostItemId, setSelectedCostItemId] = useState(lineItem.cost_item_id || "none") // Use "none" for no selection
  const [description, setDescription] = useState(lineItem.description || "")
  const [unit, setUnit] = useState(lineItem.unit || "EA")
  const [section, setSection] = useState(lineItem.section_name || "none") // Use "none" for no section
  const [isOptional, setIsOptional] = useState(lineItem.is_optional || false)
  const [isTaxable, setIsTaxable] = useState<boolean>(lineItem.is_taxable || true)
  const [assignedToUserId, setAssignedToUserId] = useState(lineItem.assigned_to_user_id || "none") // Use "none" for unassigned
  const [users, setUsers] = useState<User[]>([]);
  const [isCostItemDrawerOpen, setIsCostItemDrawerOpen] = useState(false) // State for drawer visibility

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, first_name, last_name");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data as User[]);
      }
    };
    fetchUsers();
  }, []);

  // Effect to ensure selectedCostItemId is valid when costItems change
  useEffect(() => {
    if (selectedCostItemId && selectedCostItemId !== "custom") {
      const itemExists = costItems.some(item => item.id === selectedCostItemId);
      if (!itemExists) {
        setSelectedCostItemId(""); // Reset if the selected item is no longer in the list
      }
    }
  }, [costItems, selectedCostItemId]);

  // Calculate total and update parent when relevant states change
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
      cost_item_id: selectedCostItemId === "none" ? null : selectedCostItemId, // Convert "none" to null
      section_name: section === "none" ? null : section, // Convert "none" to null
      is_optional: isOptional,
      is_taxable: isTaxable,
      assigned_to_user_id: assignedToUserId === "none" ? null : assignedToUserId, // Convert "none" to null
    })
  }, [quantity, unitCost, markup, description, unit, selectedCostItemId, section, isOptional, isTaxable, assignedToUserId])

  // Handle cost item selection from the existing dropdown
  const handleCostItemChange = (costItemId: string) => {
    setSelectedCostItemId(costItemId)

    if (costItemId && costItemId !== "custom") {
      const selectedItem = costItems.find((item) => item.id === costItemId)
      if (selectedItem) {
        setDescription(selectedItem.name)
        setUnit(selectedItem.unit)
        setUnitCost(selectedItem.unit_cost.toString())
        setMarkup(selectedItem.default_markup.toString())
      }
    }
  }

  // Handle cost item selection from the drawer
  const handleSelectCostItemFromDrawer = (item: CostItem) => {
    setSelectedCostItemId(item.id)
    setDescription(item.name)
    setUnit(item.unit)
    setUnitCost(item.unit_cost.toString())
    setMarkup(item.default_markup.toString())
    setIsCostItemDrawerOpen(false) // Close the drawer
  }

  return (
    <div className={cn("grid grid-cols-12 gap-2 items-center mb-2 p-2 rounded-md", isAISuggested && "bg-blue-50/50")}>
      <div className="col-span-4">
        <div className="space-y-2">
           {isAISuggested && (
              <div className="flex items-center text-xs text-blue-600 font-medium">
                <Sparkles className="mr-1 h-3 w-3 fill-blue-600" /> AI Suggestion
              </div>
            )}
          <div className="flex items-center space-x-2"> {/* Flex container for Select and Button */}
            <Select value={selectedCostItemId} onValueChange={handleCostItemChange}>
              <SelectTrigger className="flex-1"> {/* Make Select take available space */}
                <SelectValue placeholder="Select item or enter custom" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Clear Selection</SelectItem> {/* Use "none" for no selection */}
                <SelectItem value="custom">Custom Item</SelectItem>
                {costItems.filter(item => item.id).map((item) => ( // Filter out items with null/undefined/empty IDs
                  <SelectItem key={item.id} value={item.id}>
                    {item.item_code} - {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Sheet> {/* Wrap SheetTrigger in Sheet */}
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setIsCostItemDrawerOpen(true)}>
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Select from Catalog</span>
                </Button>
              </SheetTrigger>
              <CostItemSelectorDrawer
                isOpen={isCostItemDrawerOpen}
                onClose={() => setIsCostItemDrawerOpen(false)}
                onSelectCostItem={handleSelectCostItemFromDrawer}
              />
            </Sheet>
          </div>

          <Select value={section} onValueChange={setSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select section (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Section</SelectItem> {/* Use "none" for no section */}
              {sections.map((sectionName) => (
                sectionName !== "" && (
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`optional-${lineItem.id}`}
                checked={isOptional}
                onCheckedChange={(checked) => setIsOptional(!!checked)}
              />
              <Label htmlFor={`optional-${lineItem.id}`}>Optional</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`taxable-${lineItem.id}`}
                checked={isTaxable}
                onCheckedChange={(checked) => setIsTaxable(!!checked)}
              />
              <Label htmlFor={`taxable-${lineItem.id}`}>Taxable</Label>
            </div>

            <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Assign to user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem> {/* Use "none" for unassigned */}
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
