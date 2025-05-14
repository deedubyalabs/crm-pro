import Link from "next/link"
import { FileText, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ProjectSummary } from "@/lib/opportunities"
import { formatCurrency } from "@/lib/utils"

interface RelatedProjectsProps {
  projects: ProjectSummary[]
  opportunityId: string
}

export function RelatedProjects({ projects, opportunityId }: RelatedProjectsProps) {
  if (!projects || projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <FileText className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No projects found</h3>
        <p className="text-muted-foreground mt-2 mb-6">This opportunity hasn't been converted to a project yet.</p>
        <Button asChild>
          <Link href={`/opportunities/${opportunityId}/convert`}>Convert to Project</Link>
        </Button>
      </div>
    )
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "Pending Start":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Pending Start
          </Badge>
        )
      case "Planning":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 hover:bg-purple-50">
            Planning
          </Badge>
        )
      case "In Progress":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            In Progress
          </Badge>
        )
      case "On Hold":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            On Hold
          </Badge>
        )
      case "Awaiting Change Order Approval":
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 hover:bg-orange-50">
            Awaiting Approval
          </Badge>
        )
      case "Nearing Completion":
        return (
          <Badge variant="outline" className="bg-teal-50 text-teal-700 hover:bg-teal-50">
            Nearing Completion
          </Badge>
        )
      case "Completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Completed
          </Badge>
        )
      case "Canceled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Canceled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Related Projects</h3>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{project.project_name}</CardTitle>
                  {project.project_number && (
                    <CardDescription className="mt-1">Project #{project.project_number}</CardDescription>
                  )}
                </div>
                {getStatusBadge(project.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {project.budget_amount && (
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  Budget: {formatCurrency(project.budget_amount)}
                </div>
              )}
              <div className="flex justify-end">
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/projects/${project.id}`}>View Project</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
