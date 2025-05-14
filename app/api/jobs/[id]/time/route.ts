import { type NextRequest, NextResponse } from "next/server"
import { jobService } from "@/lib/jobs"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const jobId = params.id
    const { hours, notes } = await request.json()

    // Validate hours
    if (typeof hours !== "number" || hours <= 0) {
      return NextResponse.json({ error: "Hours must be a positive number" }, { status: 400 })
    }

    // Check if job exists
    const job = await jobService.getJobById(jobId)
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Log time
    const updatedJob = await jobService.logTime(jobId, hours, notes)

    return NextResponse.json(updatedJob)
  } catch (error) {
    console.error("Error logging time:", error)
    return NextResponse.json({ error: "Failed to log time" }, { status: 500 })
  }
}
