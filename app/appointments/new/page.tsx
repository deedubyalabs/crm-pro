import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import AppointmentForm from "../appointment-form"

export const metadata = {
  title: "New Appointment | HomePro One",
  description: "Schedule a new appointment",
}

export default function NewAppointmentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/appointments">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Appointment</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Enter the details for your new appointment</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentForm />
        </CardContent>
      </Card>
    </div>
  )
}
