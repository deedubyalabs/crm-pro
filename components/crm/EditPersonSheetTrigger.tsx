"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import PersonForm from "@/app/people/person-form"
import type { Person } from "@/lib/people"
import { Edit } from "lucide-react"

interface EditPersonSheetTriggerProps {
  person: Person
}

export default function EditPersonSheetTrigger({ person }: EditPersonSheetTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Edit className="mr-2 h-4 w-4" />
          Edit Contact
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-[500px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Contact</SheetTitle>
          <SheetDescription>
            Make changes to {person.first_name || person.business_name}'s profile.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <PersonForm initialData={person} isEdit={true} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
