"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { CalendarIcon, Filter, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ExpenseFiltersProps {
  selectedCategory?: string
  selectedStatus?: string
  startDate?: string
  endDate?: string
  billable?: boolean
  reimbursable?: boolean
}

export default function ExpenseFilters({
  selectedCategory,
  selectedStatus,
  startDate,
  endDate,
  billable,
  reimbursable,
}: ExpenseFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()

  const [category, setCategory] = useState<string | undefined>(selectedCategory)
  const [status, setStatus] = useState<string | undefined>(selectedStatus)
  const [isBillable, setIsBillable] = useState<boolean>(billable || false)
  const [isReimbursable, setIsReimbursable] = useState<boolean>(reimbursable || false)
  const [dateRange, setDateRange] = useState<{
    from?: Date
    to?: Date
  }>({
    from: startDate ? new Date(startDate) : undefined,
    to: endDate ? new Date(endDate) : undefined,
  })

  const [isFiltersVisible, setIsFiltersVisible] = useState(false)

  // Count active filters
  const activeFilterCount = [category, status, dateRange.from, dateRange.to, isBillable, isReimbursable].filter(
    Boolean,
  ).length

  useEffect(() => {
    // Show filters if any are active
    if (activeFilterCount > 0) {
      setIsFiltersVisible(true)
    }
  }, [activeFilterCount])

  const applyFilters = () => {
    const params = new URLSearchParams()

    if (category) {
      params.set("category", category)
    }

    if (status) {
      params.set("status", status)
    }

    if (dateRange.from) {
      params.set("startDate", format(dateRange.from, "yyyy-MM-dd"))
    }

    if (dateRange.to) {
      params.set("endDate", format(dateRange.to, "yyyy-MM-dd"))
    }

    if (isBillable) {
      params.set("billable", "true")
    }

    if (isReimbursable) {
      params.set("reimbursable", "true")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategory(undefined)
    setStatus(undefined)
    setDateRange({ from: undefined, to: undefined })
    setIsBillable(false)
    setIsReimbursable(false)
    router.push(pathname)
  }

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsFiltersVisible(!isFiltersVisible)}>
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        <Button size="sm" onClick={applyFilters}>
          Apply Filters
        </Button>
      </div>

      {isFiltersVisible && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="labor">Labor</SelectItem>
                    <SelectItem value="equipment">Equipment</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="travel">Travel</SelectItem>
                    <SelectItem value="permits">Permits</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="reimbursed">Reimbursed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !dateRange.from && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? format(dateRange.from, "MMM d, yyyy") : <span>Start Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.from}
                        onSelect={(date) => setDateRange({ ...dateRange, from: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("justify-start text-left font-normal", !dateRange.to && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.to ? format(dateRange.to, "MMM d, yyyy") : <span>End Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dateRange.to}
                        onSelect={(date) => setDateRange({ ...dateRange, to: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="billable"
                    checked={isBillable}
                    onCheckedChange={(checked) => setIsBillable(checked as boolean)}
                  />
                  <Label htmlFor="billable">Billable Expenses</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reimbursable"
                    checked={isReimbursable}
                    onCheckedChange={(checked) => setIsReimbursable(checked as boolean)}
                  />
                  <Label htmlFor="reimbursable">Reimbursable Expenses</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
