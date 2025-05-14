import { type NextRequest, NextResponse } from "next/server"
import { getInvoiceById } from "@/lib/invoices"
import { pdfService } from "@/lib/pdf-service"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const invoiceId = params.id
    const invoice = await getInvoiceById(invoiceId)

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    const pdfBlob = await pdfService.generateInvoicePdf(invoice)

    // Convert blob to array buffer
    const arrayBuffer = await pdfBlob.arrayBuffer()

    // Return the PDF
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Invoice_${invoice.invoice_number}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating invoice PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}
