"use client"

import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import OpportunityForm from "../opportunity-form"

export default function NewOpportunityPage({
  searchParams,
}: {
  searchParams: { personId?: string }
}) {
  const router = useRouter()
  const personId = searchParams.personId;

  return (
    <Sheet open onOpenChange={(open) => !open && router.back()}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>New Opportunity</SheetTitle>
          <SheetDescription>Enter the details for your new opportunity</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <OpportunityForm personId={personId} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
