"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash, Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { EstimateLineItem } from "@/types/estimates"
import type { User } from "@/types/auth"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip" // Import Tooltip components

interface EstimateLineItemProps {
  lineItem: Partial<EstimateLineItem>
  onUpdate: (updatedLineItem: Partial<EstimateLineItem>) => void
  onDelete: () => void
  isNew?: boolean
  isAISuggested?: boolean
}

export function EstimateLineItemRow({
  lineItem,
  onUpdate,
  onDelete,
  isNew = false,
  isAISuggested = false,
}: EstimateLineItemProps) {
  const [quantity, setQuantity] = useState(lineItem.quantity?.toString() || "1")
  const [unitCost, setUnitCost] = useState(lineItem.unit_cost?.toString() || "0")
  const [markup, setMarkup] = useState(lineItem.markup?.toString() || "0")
  const [total, setTotal] = useState(lineItem.total || 0)
  const [description, setDescription] = useState(lineItem.description || "") // Keep internal description state for editing
  const [unit, setUnit] = useState(lineItem.unit || "EA")
  const [isOptional, setIsOptional] = useState(lineItem.is_optional || false)
  const [isTaxable, setIsTaxable] = useState<boolean>(lineItem.is_taxable || true)
  const [assignedToUserId, setAssignedToUserId] = useState(lineItem.assigned_to_user_id || "none")
  const [users, setUsers] = useState<User[]>([]);

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
      is_optional: isOptional,
      is_taxable: isTaxable,
      assigned_to_user_id: assignedToUserId === "none" ? null : assignedToUserId,
      cost_item_id: lineItem.cost_item_id, // Keep existing cost_item_id if any
    })
  }, [quantity, unitCost, markup, description, unit, isOptional, isTaxable, assignedToUserId, lineItem.cost_item_id])

  return (
    <div className="mb-2 p-2 rounded-md border">
      <div className={cn("grid grid-cols-12 gap-2 items-center", isAISuggested && "bg-blue-50/50")}>
        <div className="col-span-3 flex items-center space-x-2">
          {isAISuggested && (
            <div className="flex items-center text-xs text-blue-600 font-medium mr-2">
              <Sparkles className="mr-1 h-3 w-3 fill-blue-600" /> AI Suggestion
            </div>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  placeholder="Description"
                  value={lineItem.costItem?.name || description} // Display cost item name or description
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex-1"
                />
              </TooltipTrigger>
              {lineItem.description && lineItem.description !== (lineItem.costItem?.name || '') && (
                <TooltipContent className="max-w-xs p-2 text-sm">
                  {lineItem.description}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
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
              <SelectItem value="EA">each</SelectItem>
              <SelectItem value="HR">hour</SelectItem>
              <SelectItem value="DAY">day</SelectItem>
              <SelectItem value="SQ FT">sq ft</SelectItem>
              <SelectItem value="LF">linear ft</SelectItem>
              <SelectItem value="BOX">box</SelectItem>
              <SelectItem value="ROLL">roll</SelectItem>
              <SelectItem value="GAL">gal</SelectItem>
              <SelectItem value="LB">lb</SelectItem>
              <SelectItem value="SET">set</SelectItem>
              <SelectItem value="LOT">lot</SelectItem>
              <SelectItem value="CUBIC YD">cubic yd</SelectItem>
              <SelectItem value="CUBIC FT">cubic ft</SelectItem>
              <SelectItem value="CU IN">cu in</SelectItem>              
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1">
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
        <div className="col-span-1 flex items-center justify-center">
          <Checkbox
            id={`taxable-${lineItem.id}`}
            checked={isTaxable}
            onCheckedChange={(checked) => setIsTaxable(!!checked)}
          />
        </div>
        <div className="col-span-1 text-right font-medium">{formatCurrency(total)}</div>
        <div className="col-span-1">
          <Select value={assignedToUserId} onValueChange={setAssignedToUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Assign to user (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-1 flex items-center justify-center">
          <Checkbox
            id={`optional-${lineItem.id}`}
            checked={isOptional}
            onCheckedChange={(checked) => setIsOptional(!!checked)}
          />
        </div>
        <div className="col-span-1 text-right">
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash className="h-4 w-4 text-red-500" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
