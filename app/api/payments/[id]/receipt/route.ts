import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/lib/payments"
import { pdfService } from "@/lib/pdf-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const paymentId = params.id
    const payment = await paymentService.getPaymentById(paymentId)

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    const pdfBlob = await pdfService.generatePaymentReceiptPdf(payment)

    // Convert blob to array buffer
    const arrayBuffer = await pdfBlob.arrayBuffer()

    // Return the PDF
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Receipt_${payment.reference_number || paymentId}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating payment receipt PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
