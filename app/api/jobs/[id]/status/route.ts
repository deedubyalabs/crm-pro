import { type NextRequest, NextResponse } from "next/server"
import { jobService, JOB_STATUSES } from "@/lib/jobs"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const { status } = await request.json()

    // Validate status
    if (!status || !JOB_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status. Must be one of: " + JOB_STATUSES.join(", ") }, { status: 400 })
    }

    // Check if job exists
    const job = await jobService.getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Update job status
    const updatedJob = await jobService.updateJobStatus(jobId, status)

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job status:", error)
    return NextResponse.json({ error: "Failed to update job status" }, { status: 500 })
  }
}
