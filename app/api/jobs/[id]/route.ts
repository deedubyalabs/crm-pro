import { type NextRequest, NextResponse } from "next/server"
import { jobService } from "@/lib/jobs"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const job = await jobService.getJobById(jobId)

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Failed to fetch job" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const jobData = await request.json()

    // Check if job exists
    const job = await jobService.getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Update job
    const updatedJob = await jobService.updateJob(jobId, jobData)

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id

    // Check if job exists
    const job = await jobService.getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Delete job
    await jobService.deleteJob(jobId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting job:", error)
    return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
  }
}
