import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { AppointmentSummary } from "@/lib/opportunities"

interface RelatedAppointmentsProps {
  appointments: AppointmentSummary[]
  opportunityId: string
}

export function RelatedAppointments({ appointments, opportunityId }: RelatedAppointmentsProps) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No appointments found</h3>
        <p className="text-muted-foreground mt-2 mb-6">This opportunity doesn't have any appointments scheduled yet.</p>
        <Button asChild>
          <Link href={`/appointments/new?opportunityId=${opportunityId}`}>Schedule an appointment</Link>
        </Button>
      </div>
    )
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Completed
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Canceled
          </Badge>
        )
      case "rescheduled":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Rescheduled
          </Badge>
        )
      case "no show":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            No Show
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming & Recent Appointments</h3>
        <Button asChild>
          <Link href={`/appointments/new?opportunityId=${opportunityId}`}>
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{appointment.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {appointment.formatted_date}
                  </CardDescription>
                </div>
                {getStatusBadge(appointment.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {appointment.formatted_time}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {appointment.status === "Scheduled" && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/appointments/${appointment.id}/edit`}>Reschedule</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/appointments/${appointment.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
