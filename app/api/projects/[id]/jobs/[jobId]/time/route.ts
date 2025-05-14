import { type NextRequest, NextResponse } from "next/server"
import { projectService } from "@/lib/projects"

// Updated params type to use 'id' instead of 'projectId'
export async function POST(request: NextRequest, { params }: { params: { id: string; jobId: string } }) {
  try {
    // Updated to use params.id
    const projectId = params.id
    const jobId = params.jobId
    const { hours, notes } = await request.json()

    // Validate hours
    if (typeof hours !== "number" || hours <= 0) {
      return NextResponse.json({ error: "Hours must be a positive number" }, { status: 400 })
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

    // Log time
    const updatedJob = await projectService.logJobTime(jobId, hours, notes)

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error logging time:", error)
    return NextResponse.json({ error: "Failed to log time" }, { status: 500 })
  }
}
