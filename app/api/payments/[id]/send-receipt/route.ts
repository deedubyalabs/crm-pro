import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/payments"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = params.id
    const payment = await paymentService.getPaymentById(paymentId)

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const { recipientEmail, message, includePdf, includeInvoiceLink } = await request.json()

    if (!recipientEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    await emailService.sendPaymentReceiptEmail(payment, recipientEmail, {
      message,
      includePdf: includePdf || false,
      includeLink: includeInvoiceLink || false,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending payment receipt email:", error)
    return NextResponse.json({ error: "Failed to send receipt" }, { status: 500 })
  }
}
