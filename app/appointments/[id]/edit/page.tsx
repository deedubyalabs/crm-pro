import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { appointmentService } from "@/lib/appointments"
import AppointmentForm from "../../appointment-form"

export const metadata = {
  title: "Edit Appointment | HomePro One",
  description: "Edit appointment details",
}

export default async function EditAppointmentPage({ params }: { params: { id: string } }) {
  const appointment = await appointmentService.getAppointmentById(params.id)

  if (!appointment) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/appointments/${appointment.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Appointment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Update the details for {appointment.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm initialData={appointment} appointmentId={appointment.id} />
        </CardContent>
      </Card>
    </div>
  )
}
