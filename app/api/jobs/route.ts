import { type NextRequest, NextResponse } from "next/server"
import { jobService } from "@/lib/jobs"

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json()

    // Validate required fields
    if (!jobData.name) {
      return NextResponse.json({ error: "Job name is required" }, { status: 400 })
    }

    if (!jobData.project_id) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Create job
    const newJob = await jobService.createJob(jobData)

    return NextResponse.json(newJob, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
  }
}
