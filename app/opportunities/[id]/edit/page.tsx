"use client"

import { notFound, useRouter } from "next/navigation" // Import useRouter
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { opportunityService, NewOpportunity, OpportunityWithRelations } from "@/lib/opportunities" // Import NewOpportunity and OpportunityWithRelations
import OpportunityForm from "../../opportunity-form"
import { useState, useEffect } from "react" // Import useState and useEffect
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// Metadata is typically handled in a separate layout.tsx or root page.tsx for client components
// export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
//   try {
//     const opportunity = await opportunityService.getOpportunityById(params.id)
//     if (!opportunity) {
//       return {
//         title: "Opportunity Not Found | PROActive OS",
//         description: "The requested opportunity could not be found",
//       }
//     }
//     return {
//       title: `Edit ${opportunity.opportunity_name} | PROActive OS`,
//       description: `Edit details for ${opportunity.opportunity_name}`,
//     }
//   } catch (error) {
//     return {
//       title: "Opportunity Not Found | PROActive OS",
//       description: "The requested opportunity could not be found",
//     }
//   }
// }

export default function EditOpportunityPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [opportunity, setOpportunity] = useState<OpportunityWithRelations | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(true) // Control sheet visibility

  useEffect(() => {
    const fetchOpportunity = async () => {
      const fetchedOpportunity = await opportunityService.getOpportunityById(params.id)
      if (fetchedOpportunity) {
        setOpportunity(fetchedOpportunity)
      } else {
        notFound() // Trigger Next.js notFound if opportunity is null
      }
    }

    if (params.id) {
      fetchOpportunity()
    }
  }, [params.id])

  const handleSheetClose = (open: boolean) => {
    setIsSheetOpen(open)
    if (!open) {
      // Navigate back to the opportunity's detail page or the opportunities list
      router.push(`/opportunities/${params.id}`)
    }
  }

  if (!opportunity) {
    return <div>Loading...</div> // Or a more sophisticated loading spinner
  }

  return (
    <Sheet open={isSheetOpen} onOpenChange={handleSheetClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full">
        <SheetHeader>
          <SheetTitle className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href={`/opportunities/${opportunity.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            Edit Opportunity
          </SheetTitle>
          <CardDescription>Update the details for {opportunity.opportunity_name}</CardDescription>
        </SheetHeader>
        <div className="flex-1 overflow-auto"> {/* Added overflow-auto for scrollability */}
          <Card className="border-none shadow-none"> {/* Removed border and shadow */}
            <CardContent className="p-0"> {/* Removed padding */}
              <OpportunityForm initialData={opportunity as NewOpportunity} opportunityId={opportunity.id} />
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  )
}
