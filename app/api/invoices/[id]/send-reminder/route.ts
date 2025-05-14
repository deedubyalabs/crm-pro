import { type NextRequest, NextResponse } from "next/server"
import { getInvoiceById } from "@/lib/invoices"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    const invoice = await getInvoiceById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const { recipientEmail, message, includePdf, includePaymentLink, daysOverdue } = await request.json()

    if (!recipientEmail) {
      return NextResponse.json({ error: "Recipient email is required" }, { status: 400 })
    }

    await emailService.sendPaymentReminderEmail(invoice, recipientEmail, {
      message,
      includePdf: includePdf || false,
      includeLink: includePaymentLink || false,
      daysOverdue,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending payment reminder email:", error)
    return NextResponse.json({ error: "Failed to send reminder" }, { status: 500 })
  }
}
