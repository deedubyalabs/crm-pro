import { type NextRequest, NextResponse } from "next/server"
import { squareService } from "@/lib/square-service"

export async function POST(request: NextRequest) {
  try {
    // Verify the webhook signature (in production, you should verify the signature)
    // const signature = request.headers.get("x-square-signature")

    const payload = await request.json()

    // Process the webhook
    await squareService.processWebhook(payload)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing Square webhook:", error)
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 })
  }
}
