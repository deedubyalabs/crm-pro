"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Trash, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import type { EstimatePaymentSchedule, PaymentDueType } from "@/types/estimates"

interface PaymentScheduleItemProps {
  schedule: Partial<EstimatePaymentSchedule>
  totalAmount: number
  onUpdate: (updatedSchedule: Partial<EstimatePaymentSchedule>) => void
  onDelete: () => void
}

export function PaymentScheduleItem({ schedule, totalAmount, onUpdate, onDelete }: PaymentScheduleItemProps) {
  const [description, setDescription] = useState(schedule.description || "")
  const [amount, setAmount] = useState(schedule.amount?.toString() || "0")
  const [dueType, setDueType] = useState<PaymentDueType>((schedule.due_type as PaymentDueType) || "on_acceptance")
  const [dueDays, setDueDays] = useState(schedule.due_days?.toString() || "")
  const [dueDate, setDueDate] = useState<Date | undefined>(schedule.due_date ? new Date(schedule.due_date) : undefined)

  // Update the parent component when values change
  useEffect(() => {
    onUpdate({
      ...schedule,
      description,
      amount: Number.parseFloat(amount) || 0,
      due_type: dueType,
      due_days: dueType === "days_after_acceptance" ? Number.parseInt(dueDays, 10) || null : null,
      due_date: dueType === "specific_date" ? dueDate?.toISOString().split("T")[0] || null : null,
    })
  }, [description, amount, dueType, dueDays, dueDate])

  // Handle due type change
  const handleDueTypeChange = (value: string) => {
    setDueType(value as PaymentDueType)
  }

  // Calculate percentage of total
  const percentage = totalAmount > 0 ? ((Number.parseFloat(amount) || 0) / totalAmount) * 100 : 0

  return (
    <div className="grid grid-cols-12 gap-4 items-center mb-4 p-4 border rounded-md">
      <div className="col-span-4">
        <Input
          placeholder="Description (e.g., Initial Deposit)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-right"
        />
        <div className="text-xs text-muted-foreground text-right mt-1">{percentage.toFixed(1)}% of total</div>
      </div>

      <div className="col-span-5">
        <div className="flex items-center gap-2">
          <Select value={dueType} onValueChange={handleDueTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="on_acceptance">Due on Acceptance</SelectItem>
              <SelectItem value="on_completion">Due on Completion</SelectItem>
              <SelectItem value="days_after_acceptance">Days After Acceptance</SelectItem>
              <SelectItem value="specific_date">Specific Date</SelectItem>
            </SelectContent>
          </Select>

          {dueType === "days_after_acceptance" && (
            <Input
              type="number"
              min="1"
              placeholder="Days"
              value={dueDays}
              onChange={(e) => setDueDays(e.target.value)}
              className="w-24"
            />
          )}

          {dueType === "specific_date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-[180px] pl-3 text-left font-normal", !dueDate && "text-muted-foreground")}
                >
                  {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={dueDate} onSelect={setDueDate} initialFocus />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="col-span-1 text-right">
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8">
          <Trash className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  )
}
