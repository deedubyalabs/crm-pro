import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import PersonForm from "../person-form"

export const metadata = {
  title: "New Contact | HomePro One",
  description: "Create a new contact in your database",
}

export default function NewPersonPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/people">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Contact</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Enter the details for your new contact</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonForm />
        </CardContent>
      </Card>
    </div>
  )
}
