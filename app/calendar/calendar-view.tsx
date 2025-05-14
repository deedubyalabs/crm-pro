import React from "react"
import { appointmentService } from "@/lib/appointments"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { format, parseISO, getDay, getDaysInMonth, startOfMonth } from "date-fns"

export default async function CalendarView({
  year,
  month,
  startDate,
  endDate,
}: {
  year: number
  month: number
  startDate: string
  endDate: string
}) {
  // Wrap the appointments fetch in a try/catch to handle potential errors
  let appointments = []
  try {
    appointments = await appointmentService.getAppointmentsByDateRange(startDate, endDate)
  } catch (error) {
    console.error("Error fetching appointments for calendar:", error)
    // Continue with an empty appointments array
  }

  // Create a map of dates to appointments
  const appointmentsByDate = appointments.reduce(
    (acc, appointment) => {
      const date = format(parseISO(appointment.start_time), "yyyy-MM-dd")
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(appointment)
      return acc
    },
    {} as Record<string, typeof appointments>,
  )

  // Generate calendar grid
  const daysInMonth = getDaysInMonth(new Date(year, month))
  const firstDayOfMonth = getDay(startOfMonth(new Date(year, month)))

  // Create array of day numbers with empty slots for the start of the month
  const days = Array.from({ length: firstDayOfMonth }, () => null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1),
  )

  // Fill out the grid to complete the last week
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    days.push(...Array.from({ length: remainingDays }, () => null))
  }

  // Split days into weeks
  const weeks = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  // Helper function to get status color
  function getStatusColor(status: string) {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "confirmed":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "completed":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "rescheduled":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100"
      default:
        return ""
    }
  }

  return (
    <div className="calendar">
      <div className="grid grid-cols-7 gap-px bg-slate-200">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="bg-white p-2 text-center text-sm font-medium">
            {day}
          </div>
        ))}

        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((day, dayIndex) => {
              if (day === null) {
                return <div key={`empty-${weekIndex}-${dayIndex}`} className="bg-white p-2 min-h-[120px]"></div>
              }

              const date = new Date(year, month, day)
              const dateString = format(date, "yyyy-MM-dd")
              const dayAppointments = appointmentsByDate[dateString] || []
              const isToday = format(new Date(), "yyyy-MM-dd") === dateString

              return (
                <div
                  key={`day-${day}`}
                  className={`bg-white p-2 min-h-[120px] ${isToday ? "border-2 border-blue-500" : ""}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium ${isToday ? "text-blue-600" : ""}`}>{day}</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" asChild>
                      <Link href={`/appointments/new?date=${dateString}`}>+</Link>
                    </Button>
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((appointment) => (
                      <Link key={appointment.id} href={`/appointments/${appointment.id}`} className="block">
                        <div className="text-xs truncate">
                          <Badge className={getStatusColor(appointment.status)}>
                            {format(parseISO(appointment.start_time), "h:mm a")}
                          </Badge>{" "}
                          {appointment.title}
                        </div>
                      </Link>
                    ))}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-muted-foreground">+{dayAppointments.length - 3} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
