"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import PersonForm from "../person-form"
import { useState } from "react" // Import useState
import { useRouter } from "next/navigation" // Import useRouter
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

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
    <Dialog open={isSheetOpen} onOpenChange={handleSheetClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href="/people">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            New Contact
          </DialogTitle>
          <DialogDescription>Enter the details for your new contact</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <PersonForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
