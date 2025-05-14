import { NextResponse } from "next/server"
import { bigboxService } from "@/lib/bigbox-service"

export async function GET() {
  try {
    const syncedCount = await bigboxService.syncAllCostItems()

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} cost items with BigBox prices`,
      syncedCount,
    })
  } catch (error: any) {
    console.error("Error syncing BigBox prices:", error)

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to sync BigBox prices",
      },
      { status: 500 },
    )
  }
}
