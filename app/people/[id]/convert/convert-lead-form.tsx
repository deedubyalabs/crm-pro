"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"
import type { Person } from "@/lib/people"

interface ConvertLeadFormProps {
  person: Person
}

export default function ConvertLeadForm({ person }: ConvertLeadFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createOpportunity, setCreateOpportunity] = useState(true)

  async function handleConvert() {
    if (person.person_type !== "lead") {
      // Changed from 'type' to 'person_type'
      toast({
        title: "Error",
        description: "Only leads can be converted to customers",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Update the person type to customer
      await personService.updatePerson(person.id, {
        person_type: "customer", // Changed from 'type' to 'person_type'
        updated_at: new Date().toISOString(),
      })

      // Create an opportunity if the checkbox is checked
      if (createOpportunity) {
        // This would be handled by the opportunity service
        // For now, we'll just simulate it with a delay
        await new Promise((resolve) => setTimeout(resolve, 500))
      }

      toast({
        title: "Lead converted",
        description: `${personService.getDisplayName(person)} has been converted to a customer.`,
      })

      // Redirect to the person detail page
      router.push(`/people/${person.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="create-opportunity"
            checked={createOpportunity}
            onCheckedChange={(checked) => setCreateOpportunity(checked as boolean)}
          />
          <Label htmlFor="create-opportunity">Create an opportunity for this customer</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          Converting this lead will change their status to customer and optionally create a new opportunity.
        </p>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button onClick={handleConvert} disabled={isSubmitting}>
          {isSubmitting ? "Converting..." : "Convert to Customer"}
        </Button>
      </div>
    </div>
  )
}
