import { notFound } from "next/navigation"
import { projectService } from "@/lib/projects"
import JobForm from "../job-form"

export default async function NewJobPage({ params }: { params: { id: string } }) {
  const project = await projectService.getProjectById(params.id).catch(() => null)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Job</h1>
        <p className="text-muted-foreground">Create a new job for project &quot;{project.project_name}&quot;.</p>
      </div>

      <JobForm projectId={project.id} />
    </div>
  )
}
