import { notFound } from "next/navigation"
import { jobService } from "@/lib/jobs"
import { projectService } from "@/lib/projects"
import JobForm from "../../job-form"

export default async function EditJobPage({ params }: { params: { id: string } }) {
  try {
    const job = await jobService.getJobById(params.id)
    if (!job) {
      notFound()
    }

    // Fetch projects for the form
    const projects = await projectService.getProjects()

    // Format projects for the form
    const formattedProjects = projects.map((project) => ({
      id: project.id,
      project_name: project.project_name,
    }))

    // TODO: Fetch users for assignment (when user management is implemented)
    const users = [
      { id: "1", name: "John Doe" },
      { id: "2", name: "Jane Smith" },
    ]

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Job</h1>
          <p className="text-muted-foreground">Update job details for "{job.job_name}"</p>
        </div>

        <JobForm projects={formattedProjects} users={users} initialData={job} jobId={job.id} />
      </div>
    )
  } catch (error) {
    console.error("Error loading job for editing:", error)
    notFound()
  }
}
