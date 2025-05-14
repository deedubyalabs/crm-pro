import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { opportunityService } from "@/lib/opportunities"
import OpportunityForm from "../../opportunity-form"

export const metadata = {
  title: "Edit Opportunity | HomePro One",
  description: "Edit opportunity details",
}

export default async function EditOpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = await opportunityService.getOpportunityById(params.id)

  if (!opportunity) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/opportunities/${opportunity.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Opportunity</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Opportunity Details</CardTitle>
          <CardDescription>Update the details for {opportunity.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <OpportunityForm initialData={opportunity} opportunityId={opportunity.id} />
        </CardContent>
      </Card>
    </div>
  )
}
