import { type NextRequest, NextResponse } from "next/server"
import { projectService } from "@/lib/projects"

// Updated params type to use 'id' instead of 'projectId'
export async function PATCH(request: NextRequest, { params }: { params: { id: string; jobId: string } }) {
  try {
    // Updated to use params.id
    const projectId = params.id
    const jobId = params.jobId
    const { status } = await request.json()

    // Validate status
    const JOB_STATUSES = ["Pending", "Scheduled", "In Progress", "Blocked", "Completed", "Canceled"]
    if (!status || !JOB_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be one of: " + JOB_STATUSES.join(", ") }, { status: 400 })
    }

    // Check if job exists and belongs to the project
    const job = await projectService.getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Use the projectId obtained from params.id for comparison
    if (job.project_id !== projectId) {
      return NextResponse.json({ error: "Job does not belong to this project" }, { status: 403 })
    }

    // Update job status
    const updatedJob = await projectService.updateJobStatus(jobId, status)

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({ error: "Failed to update job status" }, { status: 500 })
  }
}
