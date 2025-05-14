"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

export default function DateRangeSelector({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}) {
  const router = useRouter()
  const [date, setDate] = useState<{
    from: Date
    to: Date | undefined
  }>({
    from: new Date(startDate),
    to: new Date(endDate),
  })

  const handleApply = () => {
    if (date.from && date.to) {
      const params = new URLSearchParams()
      params.set("startDate", format(date.from, "yyyy-MM-dd"))
      params.set("endDate", format(date.to, "yyyy-MM-dd"))
      router.push(`/financial-dashboard?${params.toString()}`)
    }
  }

  const handleQuickSelect = (period: "thisMonth" | "lastMonth" | "thisQuarter" | "thisYear" | "lastYear") => {
    const now = new Date()
    let from: Date
    let to: Date

    switch (period) {
      case "thisMonth":
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = new Date()
        break
      case "lastMonth":
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case "thisQuarter":
        const quarter = Math.floor(now.getMonth() / 3)
        from = new Date(now.getFullYear(), quarter * 3, 1)
        to = new Date()
        break
      case "thisYear":
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date()
        break
      case "lastYear":
        from = new Date(now.getFullYear() - 1, 0, 1)
        to = new Date(now.getFullYear() - 1, 11, 31)
        break
      default:
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date()
    }

    setDate({ from, to })

    const params = new URLSearchParams()
    params.set("startDate", format(from, "yyyy-MM-dd"))
    params.set("endDate", format(to, "yyyy-MM-dd"))
    router.push(`/financial-dashboard?${params.toString()}`)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={() => handleQuickSelect("thisMonth")}>
          This Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickSelect("lastMonth")}>
          Last Month
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleQuickSelect("thisYear")}>
          This Year
        </Button>
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            selected={date}
            onSelect={(range) => setDate(range as { from: Date; to: Date | undefined })}
            initialFocus
          />
          <div className="p-3 border-t border-border">
            <Button size="sm" onClick={handleApply} className="w-full">
              Apply Range
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
