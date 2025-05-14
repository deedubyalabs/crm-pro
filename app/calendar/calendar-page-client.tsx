"use client"

import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CalendarIcon } from "lucide-react"
import { format, startOfMonth, endOfMonth } from "date-fns"
import CalendarView from "./calendar-view"
import CalendarViewSkeleton from "./calendar-view-skeleton"
import { useRouter } from "next/navigation"

export default function CalendarPageClient({
  searchParams,
}: {
  searchParams: {
    month?: string
    year?: string
  }
}) {
  const { month: monthParam, year: yearParam } = searchParams

  // Default to current month if not specified
  const currentDate = new Date()
  const month = monthParam ? Number.parseInt(monthParam) - 1 : currentDate.getMonth()
  const year = yearParam ? Number.parseInt(yearParam) : currentDate.getFullYear()

  const selectedDate = new Date(year, month, 1)
  const startDate = startOfMonth(selectedDate)
  const endDate = endOfMonth(selectedDate)
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">View and manage your schedule</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link href="/appointments">
              <CalendarIcon className="mr-2 h-4 w-4" /> List View
            </Link>
          </Button>
          <Button asChild>
            <Link href="/appointments/new">
              <Plus className="mr-2 h-4 w-4" /> New Appointment
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/calendar?month=${month === 0 ? 12 : month}&year=${month === 0 ? year - 1 : year}`}>
                  Previous
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date()
                  router.push(`/calendar?month=${today.getMonth() + 1}&year=${today.getFullYear()}`)
                }}
              >
                Today
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/calendar?month=${month === 11 ? 1 : month + 2}&year=${month === 11 ? year + 1 : year}`}>
                  Next
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<CalendarViewSkeleton />}>
            <CalendarView
              year={year}
              month={month}
              startDate={format(startDate, "yyyy-MM-dd")}
              endDate={format(endDate, "yyyy-MM-dd")}
            />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
