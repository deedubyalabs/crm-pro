import { notFound } from "next/navigation"
import { estimateService } from "@/lib/estimates"
import { projectService } from "@/lib/projects"
import GenerateMaterialListForm from "./generate-material-list-form"

interface GenerateMaterialListPageProps {
  params: {
    id: string
  }
}

export default async function GenerateMaterialListPage({ params }: GenerateMaterialListPageProps) {
  const estimate = await estimateService.getEstimateById(params.id)

  if (!estimate) {
    notFound()
  }

  // Get project if available
  let project = null
  if (estimate.opportunity?.id) {
    // Try to find a project linked to this opportunity
    const projects = await projectService.getProjects({
      opportunityId: estimate.opportunity.id,
    })
    if (projects.length > 0) {
      project = projects[0]
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Generate Material List</h1>
        <p className="text-muted-foreground">
          Create a material list from Estimate {estimate.estimate_number || params.id}
        </p>
      </div>

      <GenerateMaterialListForm estimate={estimate} project={project} />
    </div>
  )
}
