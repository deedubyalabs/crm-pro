"use client"

import { notFound, useRouter } from "next/navigation" // Import useRouter
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { personService } from "@/lib/people"
import PersonForm from "../../person-form"
import { useState, useEffect } from "react" // Import useState and useEffect
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Person } from "@/lib/people" // Import Person type

// Metadata is typically handled in a separate layout.tsx or root page.tsx for client components
// export const metadata = {
//   title: "Edit Contact | HomePro One",
//   description: "Edit contact details",
// }

export default function EditPersonPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [person, setPerson] = useState<Person | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(true) // Control sheet visibility

  useEffect(() => {
    const fetchPerson = async () => {
      const fetchedPerson = await personService.getPersonById(params.id)
      if (fetchedPerson) {
        setPerson(fetchedPerson)
      } else {
        notFound() // Trigger Next.js notFound if person is null
      }
    }

    if (params.id) {
      fetchPerson()
    }
  }, [params.id])

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      // Navigate back to the person's detail page or the people list
      router.push(`/people/${params.id}`)
    }
  }

  if (!person) {
    return <div>Loading...</div> // Or a more sophisticated loading spinner
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href={`/people/${person.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            Edit Contact
          </SheetTitle>
          <CardDescription>Update the details for {personService.getDisplayName(person)}</CardDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto"> {/* Added overflow-auto for scrollability */}
          <Card className="border-none shadow-none"> {/* Removed border and shadow */}
            <CardContent className="p-0"> {/* Removed padding */}
              <PersonForm initialData={person} isEdit={true} />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
