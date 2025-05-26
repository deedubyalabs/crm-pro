"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import PersonForm from "../person-form"
import { useState } from "react" // Import useState
import { useRouter } from "next/navigation" // Import useRouter
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// Metadata is typically handled in a separate layout.tsx or root page.tsx for client components
// export const metadata = {
//   title: "New Contact | HomePro One",
//   description: "Create a new contact in your database",
// }

export default function NewPersonPage() {
  const router = useRouter()
  const [isSheetOpen, setIsSheetOpen] = useState(true) // Control sheet visibility

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      // Navigate back to the people list
      router.push("/people")
    }
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href="/people">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            New Contact
          </SheetTitle>
          <CardDescription>Enter the details for your new contact</CardDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto"> {/* Added overflow-auto for scrollability */}
          <Card className="border-none shadow-none"> {/* Removed border and shadow */}
            <CardContent className="p-0"> {/* Removed padding */}
              <PersonForm />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
