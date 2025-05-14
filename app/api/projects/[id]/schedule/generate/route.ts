import { type NextRequest, NextResponse } from "next/server"
import { schedulerService } from "@/lib/scheduler-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id
    const { startDate, useTemplates, includeWeather } = await request.json()

    const tasks = await schedulerService.generateProjectSchedule(projectId, {
      startDate,
      useTemplates,
      includeWeatherData: includeWeather,
    })

    return NextResponse.json({ success: true, tasks })
  } catch (error) {
    console.error("Error generating schedule:", error)
    return NextResponse.json({ success: false, error: "Failed to generate schedule" }, { status: 500 })
  }
}
