import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle } from "lucide-react"
import { personService } from "@/lib/people"
import ConvertLeadForm from "./convert-lead-form"

export const metadata = {
  title: "Convert Lead | HomePro One",
  description: "Convert a lead to a customer",
}

export default async function ConvertLeadPage({ params }: { params: { id: string } }) {
  const person = await personService.getPersonById(params.id)

  if (!person) {
    notFound()
  }

  // If not a lead, redirect to person page
  if (person.type !== "lead") {
    redirect(`/people/${person.id}`)
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
        <h1 className="text-3xl font-bold tracking-tight">Convert Lead</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Convert Lead to Customer</CardTitle>
          <CardDescription>Convert {personService.getDisplayName(person)} from a lead to a customer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-md mb-6">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-medium">Lead Qualification</h3>
              <p className="text-sm text-muted-foreground">
                Converting a lead to a customer will change their status and allow you to create projects, estimates,
                and invoices for them.
              </p>
            </div>
          </div>

          <ConvertLeadForm person={person} />
        </CardContent>
      </Card>
    </div>
  )
}
