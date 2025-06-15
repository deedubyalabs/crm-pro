"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Trash, Sparkles, Edit, Check, X } from "lucide-react"
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
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { CostItemType } from "@/types/cost-items"

interface EstimateLineItemProps {
  lineItem: Partial<EstimateLineItem>
  onUpdate: (updatedLineItem: Partial<EstimateLineItem>) => void
  onDelete: () => void
  isNew?: boolean
  isAISuggested?: boolean
  index: number
}

const getBadgeVariant = (type: CostItemType) => {
  switch (type) {
    case "Material":
      return "secondary"
    case "Labor":
      return "secondary"
    case "Equipment":
      return "outline"
    case "Subcontractor":
      return "destructive"
    case "Other":
      return "outline"
    default:
      return "default"
  }
}

export function EstimateLineItemRow({
  lineItem,
  onUpdate,
  onDelete,
  isNew = false,
  isAISuggested = false,
  index,
}: EstimateLineItemProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [editedLineItem, setEditedLineItem] = useState(lineItem)
  const [users, setUsers] = useState<User[]>([])
  const [liveTotal, setLiveTotal] = useState(lineItem.total || 0)

  useEffect(() => {
    setEditedLineItem(lineItem)
  }, [lineItem])

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, first_name, last_name")
      if (error) {
        console.error("Error fetching users:", error)
      } else {
        setUsers(data as User[])
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (isEditing) {
      const qty = Number.parseFloat(String(editedLineItem.quantity)) || 0
      const cost = Number.parseFloat(String(editedLineItem.unit_cost)) || 0
      const mkp = Number.parseFloat(String(editedLineItem.markup)) || 0

      const subtotal = qty * cost
      const markupAmount = subtotal * (mkp / 100)
      const newTotal = subtotal + markupAmount

      setLiveTotal(newTotal)
    }
  }, [isEditing, editedLineItem.quantity, editedLineItem.unit_cost, editedLineItem.markup])

  const handleFieldChange = (updates: Partial<EstimateLineItem>) => {
    setEditedLineItem((prev: Partial<EstimateLineItem>) => ({ ...prev, ...updates }))
  }

  const handleSave = () => {
    const qty = Number.parseFloat(String(editedLineItem.quantity)) || 0
    const cost = Number.parseFloat(String(editedLineItem.unit_cost)) || 0
    const mkp = Number.parseFloat(String(editedLineItem.markup)) || 0

    const subtotal = qty * cost
    const markupAmount = subtotal * (mkp / 100)
    const newTotal = subtotal + markupAmount

    onUpdate({
      ...editedLineItem,
      quantity: qty,
      unit_cost: cost,
      markup: mkp,
      total: newTotal,
      assigned_to_user_id: editedLineItem.assigned_to_user_id === "none" ? null : editedLineItem.assigned_to_user_id,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedLineItem(lineItem)
    setIsEditing(false)
    if (isNew) {
      onDelete()
    }
  }

  const assignedUser = users.find(u => u.id === lineItem.assigned_to_user_id)

  if (isEditing) {
    return (
      <tr className={cn("items-center", index % 2 === 0 ? "bg-blue-50" : "bg-white")}>
        <td className="p-2">
          {lineItem.costItem?.type ? (
            <Badge variant={getBadgeVariant(lineItem.costItem.type as CostItemType)} className="text-[10px]">{lineItem.costItem.type}</Badge>
          ) : (
            <span className="text-[10px] text-muted-foreground">N/A</span>
          )}
        </td>
        <td className="p-2">
          <Input
            placeholder="Description"
            value={editedLineItem.costItem?.name || editedLineItem.description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange({ description: e.target.value })}
            className="flex-1"
            style={{ fontSize: '10px' }}
          />
        </td>
        <td className="p-2">
          <Input type="number" min="0" step="0.01" value={editedLineItem.quantity?.toString() || "1"} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange({ quantity: parseFloat(e.target.value) || 0 })} style={{ fontSize: '10px' }} />
        </td>
        <td className="p-2">
          <Select value={editedLineItem.unit || "EA"} onValueChange={(value: string) => handleFieldChange({ unit: value })}>
            <SelectTrigger style={{ fontSize: '10px' }}>
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
        </td>
        <td className="p-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedLineItem.unit_cost?.toString() || "0"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange({ unit_cost: parseFloat(e.target.value) || 0 })}
            className="text-right"
            style={{ fontSize: '10px' }}
          />
        </td>
        <td className="p-2">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={editedLineItem.markup?.toString() || "0"}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange({ markup: parseFloat(e.target.value) || 0 })}
            className="text-right"
            style={{ fontSize: '10px' }}
          />
        </td>
        <td className="p-2 text-center">
          <Checkbox
            id={`taxable-${lineItem.id}`}
            checked={editedLineItem.is_taxable}
            onCheckedChange={(checked: boolean) => handleFieldChange({ is_taxable: !!checked })}
          />
        </td>
        <td className="p-2 text-right font-medium" style={{ fontSize: '10px' }}>{formatCurrency(liveTotal)}</td>
        <td className="p-2">
          <Select value={editedLineItem.assigned_to_user_id || "none"} onValueChange={(value: string) => handleFieldChange({ assigned_to_user_id: value })}>
            <SelectTrigger style={{ fontSize: '10px' }}>
              <SelectValue placeholder="Assign..." />
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
        </td>
        <td className="p-2 text-center">
          <Checkbox
            id={`optional-${lineItem.id}`}
            checked={editedLineItem.is_optional}
            onCheckedChange={(checked: boolean) => handleFieldChange({ is_optional: !!checked })}
          />
        </td>
        <td className="p-2 flex items-center justify-end space-x-1">
          <Button variant="ghost" size="icon" onClick={handleSave} className="h-8 w-8">
            <Check className="h-4 w-4 text-green-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleCancel} className="h-8 w-8">
            <X className="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
            <Trash className="h-4 w-4 text-red-500" />
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <tr className={cn("items-center", index % 2 === 0 ? "bg-gray-50" : "bg-white")}>
      <td className="p-2">
        {lineItem.costItem?.type ? (
          <Badge variant={getBadgeVariant(lineItem.costItem.type as CostItemType)} className="text-[10px]">{lineItem.costItem.type}</Badge>
        ) : (
          <span className="text-[10px] text-muted-foreground">N/A</span>
        )}
      </td>
      <td className="p-2 text-[10px] font-medium">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <p className="truncate text-left">{lineItem.costItem?.name || lineItem.description}</p>
            </TooltipTrigger>
            {lineItem.description && lineItem.description !== (lineItem.costItem?.name || '') && (
              <TooltipContent className="max-w-xs p-2" style={{ fontSize: '10px' }}>
                {lineItem.description}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="p-2 text-[10px] text-center">{lineItem.quantity}</td>
      <td className="p-2 text-[10px] text-center">{lineItem.unit}</td>
      <td className="p-2 text-[10px] text-right">{formatCurrency(lineItem.unit_cost || 0)}</td>
      <td className="p-2 text-[10px] text-right">{lineItem.markup || 0}%</td>
      <td className="p-2 text-center">
        <Checkbox checked={lineItem.is_taxable} disabled />
      </td>
      <td className="p-2 text-right font-medium" style={{ fontSize: '10px' }}>{formatCurrency(lineItem.total || 0)}</td>
      <td className="p-2 text-[10px] text-center truncate">
        {assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Unassigned'}
      </td>
      <td className="p-2 text-center">
        <Checkbox checked={lineItem.is_optional} disabled />
      </td>
      <td className="p-2 flex items-center justify-end space-x-1">
        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)} className="h-8 w-8">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      </td>
    </tr>
  )
}
