import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { personService } from "@/lib/people"
import PersonForm from "../../person-form"

export const metadata = {
  title: "Edit Contact | HomePro One",
  description: "Edit contact details",
}

export default async function EditPersonPage({ params }: { params: { id: string } }) {
  const person = await personService.getPersonById(params.id)

  if (!person) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/people/${person.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Contact</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Update the details for {personService.getDisplayName(person)}</CardDescription>
        </CardHeader>
        <CardContent>
          <PersonForm initialData={person} personId={person.id} />
        </CardContent>
      </Card>
    </div>
  )
}
