import { notFound } from "next/navigation"
import { opportunityService } from "@/lib/opportunities"
import ConvertOpportunityForm from "./convert-opportunity-form"

export default async function ConvertOpportunityPage({ params }: { params: { id: string } }) {
  const opportunity = await opportunityService.getOpportunityById(params.id).catch(() => null)

  if (!opportunity) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Convert Opportunity to Project</h1>
        <p className="text-muted-foreground">Convert &quot;{opportunity.opportunity_name}&quot; to a new project.</p>
      </div>

      <ConvertOpportunityForm opportunity={opportunity} />
    </div>
  )
}
