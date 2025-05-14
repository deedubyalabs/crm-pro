import { projectService } from "@/lib/projects"
import JobForm from "../job-form"

export default async function NewJobPage() {
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
        <h1 className="text-2xl font-bold tracking-tight">Create New Job</h1>
        <p className="text-muted-foreground">Add a new job to track work for a project</p>
      </div>

      <JobForm projects={formattedProjects} users={users} />
    </div>
  )
}
