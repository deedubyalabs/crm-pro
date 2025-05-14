import { type NextRequest, NextResponse } from "next/server"
import { materialListService } from "@/lib/material-list-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const estimateId = params.id
    const { name, description, project_id, apply_waste_factors } = await request.json()

    // Validate required fields
    if (!project_id) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 })
    }

    // Generate material list from estimate
    const materialList = await materialListService.generateFromEstimate(estimateId, project_id, {
      name,
      description,
      applyWasteFactors: apply_waste_factors,
    })

    return NextResponse.json(materialList)
  } catch (error) {
    console.error("Error generating material list:", error)
    return NextResponse.json({ message: error instanceof Error ? error.message : "An error occurred" }, { status: 500 })
  }
}
