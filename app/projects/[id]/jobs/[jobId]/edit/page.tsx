import { notFound } from "next/navigation"
import { projectService } from "@/lib/projects"
import JobForm from "../../job-form"

export default async function EditJobPage({ params }: { params: { id: string; jobId: string } }) {
  const job = await projectService.getJobById(params.jobId).catch(() => null)

  if (!job || job.project_id !== params.id) {
    notFound()
  }

  const project = await projectService.getProjectById(params.id).catch(() => null)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
        <p className="text-muted-foreground">
          Edit job &quot;{job.job_name}&quot; for project &quot;{project.project_name}&quot;.
        </p>
      </div>

      <JobForm projectId={project.id} initialData={job} jobId={job.id} />
    </div>
  )
}
