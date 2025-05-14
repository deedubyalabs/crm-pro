import { type NextRequest, NextResponse } from "next/server"
import { schedulerService } from "@/lib/scheduler-service"
import type { ScheduleOptimizationOptions } from "@/types/scheduler"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const options: ScheduleOptimizationOptions = await request.json()

    const tasks = await schedulerService.optimizeSchedule(projectId, options)

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error("Error optimizing schedule:", error)
    return NextResponse.json({ success: false, error: "Failed to optimize schedule" }, { status: 500 })
  }
}
