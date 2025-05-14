import { notFound } from "next/navigation"
import { projectService } from "@/lib/projects"
import JobStatusUpdater from "./job-status-updater"

export default async function UpdateJobStatusPage({ params }: { params: { id: string; jobId: string } }) {
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
        <h1 className="text-2xl font-bold tracking-tight">Update Status</h1>
        <p className="text-muted-foreground">
          Update status for job &quot;{job.job_name}&quot; in project &quot;{project.project_name}&quot;.
        </p>
      </div>

      <JobStatusUpdater projectId={project.id} job={job} />
    </div>
  )
}
