import { notFound } from "next/navigation"
import { projectService } from "@/lib/projects"
import JobTimeLogger from "./job-time-logger"

export default async function LogJobTimePage({ params }: { params: { id: string; jobId: string } }) {
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
        <h1 className="text-2xl font-bold tracking-tight">Log Time</h1>
        <p className="text-muted-foreground">
          Log time for job &quot;{job.job_name}&quot; in project &quot;{project.project_name}&quot;.
        </p>
      </div>

      <JobTimeLogger projectId={project.id} job={job} />
    </div>
  )
}
