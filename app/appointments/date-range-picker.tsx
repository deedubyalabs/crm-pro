"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { useRouter, usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DateRangePickerProps {
  from: Date
  to: Date
  className?: string
}

export function DateRangePicker({ from, to, className }: DateRangePickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [date, setDate] = React.useState<DateRange | undefined>({
    from,
    to,
  })

  // Update URL when date range changes
  const updateDateRange = (range: DateRange | undefined) => {
    if (!range?.from) return

    const searchParams = new URLSearchParams(window.location.search)

    if (range.from) {
      searchParams.set("from", format(range.from, "yyyy-MM-dd"))
    } else {
      searchParams.delete("from")
    }

    if (range.to) {
      searchParams.set("to", format(range.to, "yyyy-MM-dd"))
    } else {
      searchParams.delete("to")
    }

    router.push(`${pathname}?${searchParams.toString()}`)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn("w-[260px] justify-start text-left font-normal", !date && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
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
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range)
              updateDateRange(range)
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
