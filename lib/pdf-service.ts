import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { InvoiceWithDetails } from "@/types/invoices"
import type { PaymentWithDetails } from "@/types/payments"

export const pdfService = {
  /**
   * Generate a PDF invoice
   */
  async generateInvoicePdf(invoice: InvoiceWithDetails): Promise<Blob> {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set document properties
    doc.setProperties({
      title: `Invoice #${invoice.invoice_number}`,
      subject: `Invoice for ${invoice.project.project_name}`,
      author: "HomePro One",
      creator: "HomePro One",
    })

    // Add company logo and information
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("HomePro One", 20, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("123 Main Street", 20, 25)
    doc.text("Anytown, CA 12345", 20, 30)
    doc.text("Phone: (555) 555-5555", 20, 35)
    doc.text("Email: info@homeproone.com", 20, 40)

    // Add invoice information
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text(`INVOICE #${invoice.invoice_number}`, 140, 20, { align: "right" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Date: ${formatDate(invoice.issue_date ?? new Date().toISOString())}`, 140, 25, { align: "right" })
    doc.text(`Due Date: ${formatDate(invoice.due_date ?? new Date().toISOString())}`, 140, 30, { align: "right" })
    doc.text(`Status: ${invoice.status}`, 140, 35, { align: "right" })

    // Add customer information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Bill To:", 20, 55)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    if (invoice.person.business_name) {
      doc.text(invoice.person.business_name, 20, 60)
      if (invoice.person.first_name || invoice.person.last_name) {
        doc.text(`${invoice.person.first_name || ""} ${invoice.person.last_name || ""}`.trim(), 20, 65)
      }
    } else {
      doc.text(`${invoice.person.first_name || ""} ${invoice.person.last_name || ""}`.trim(), 20, 60)
    }

    // Add project information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Project:", 120, 55)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(invoice.project.project_name, 120, 60)

    // Add line items
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Invoice Items", 20, 80)

    // Group line items by section
    const lineItemsBySection: Record<string, any[]> = {}
    let currentSection = "Default"

    invoice.line_items.forEach((item) => {
      if (item.is_section_header) {
        currentSection = item.section_title || item.description
      } else {
        if (!lineItemsBySection[currentSection]) {
          lineItemsBySection[currentSection] = []
        }
        lineItemsBySection[currentSection].push(item)
      }
    })

    // Prepare table data
    const tableData: any[] = []
    let sectionIndex = 0

    Object.entries(lineItemsBySection).forEach(([section, items]) => {
      // Add section header if not default
      if (section !== "Default" || Object.keys(lineItemsBySection).length > 1) {
        tableData.push([{ content: section, colSpan: 5, styles: { fontStyle: "bold", fillColor: [240, 240, 240] } }])
      }

      // Add items in this section
      items.forEach((item) => {
        tableData.push([
          item.description,
          item.quantity,
          item.unit,
          formatCurrency(item.unit_price),
          formatCurrency(item.total),
        ])
      })

      // Add a blank row between sections if not the last section
      sectionIndex++
      if (sectionIndex < Object.keys(lineItemsBySection).length) {
        tableData.push([{ content: "", colSpan: 5, styles: { cellPadding: 2 } }])
      }
    })

    // Add the table
    autoTable(doc, {
      startY: 85,
      head: [["Description", "Quantity", "Unit", "Unit Price", "Total"]],
      body: tableData,
      theme: "grid",
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { cellWidth: 20, halign: "center" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 30, halign: "right" },
        4: { cellWidth: 30, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    })

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || 150

    // Add totals
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Subtotal:", 120, finalY + 10, { align: "right" })
    doc.text(formatCurrency(invoice.total_amount), 170, finalY + 10, { align: "right" })

    doc.text("Amount Paid:", 120, finalY + 15, { align: "right" })
    doc.text(formatCurrency(invoice.amount_paid || 0), 170, finalY + 15, { align: "right" })

    doc.setFont("helvetica", "bold")
    doc.text("Balance Due:", 120, finalY + 20, { align: "right" })
    doc.text(formatCurrency(invoice.total_amount - (invoice.amount_paid || 0)), 170, finalY + 20, { align: "right" })

    // Add notes if available
    if (invoice.notes) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, finalY + 30)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(invoice.notes, 20, finalY + 35)
    }

    // Add payment instructions
    doc.setFontSize(12)
    doc.setFont("helvetica", 'bold")tica', "bold")
    doc.text("Payment Instructions:", 20, finalY + 45)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("Please make checks payable to HomePro One", 20, finalY + 50)
    doc.text("For electronic payments, please contact our office", 20, finalY + 55)

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `Thank you for your business! | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      )
    }

    // Return the PDF as a blob
    return doc.output("blob")
  },

  /**
   * Generate a PDF receipt for a payment
   */
  async generatePaymentReceiptPdf(payment: PaymentWithDetails): Promise<Blob> {
    // Create a new PDF document
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Set document properties
    doc.setProperties({
      title: `Receipt for Payment on Invoice #${payment.invoice.invoice_number}`,
      subject: `Payment Receipt for ${payment.project.project_name}`,
      author: "HomePro One",
      creator: "HomePro One",
    })

    // Add company logo and information
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("HomePro One", 20, 20)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("123 Main Street", 20, 25)
    doc.text("Anytown, CA 12345", 20, 30)
    doc.text("Phone: (555) 555-5555", 20, 35)
    doc.text("Email: info@homeproone.com", 20, 40)

    // Add receipt information
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT RECEIPT", 140, 20, { align: "right" })

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`Receipt Date: ${formatDate(new Date().toISOString())}`, 140, 25, { align: "right" })
    doc.text(`Payment Date: ${formatDate(payment.payment_date)}`, 140, 30, { align: "right" })
    doc.text(`Invoice #: ${payment.invoice.invoice_number}`, 140, 35, { align: "right" })
    doc.text(`Reference #: ${payment.reference_number || "N/A"}`, 140, 40, { align: "right" })

    // Add customer information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Received From:", 20, 55)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    if (payment.person.business_name) {
      doc.text(payment.person.business_name, 20, 60)
      if (payment.person.first_name || payment.person.last_name) {
        doc.text(`${payment.person.first_name || ""} ${payment.person.last_name || ""}`.trim(), 20, 65)
      }
    } else {
      doc.text(`${payment.person.first_name || ""} ${payment.person.last_name || ""}`.trim(), 20, 60)
    }

    // Add project information
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Project:", 120, 55)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(payment.project.project_name, 120, 60)

    // Add payment details
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("Payment Details", 20, 80)

    // Create payment details table
    autoTable(doc, {
      startY: 85,
      head: [["Description", "Amount"]],
      body: [
        [`Payment for Invoice #${payment.invoice.invoice_number}`, formatCurrency(payment.amount)],
        ["Payment Method", payment.payment_method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 70, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    })

    // Get the final Y position after the table
    const finalY = (doc as any).lastAutoTable.finalY || 120

    // Add total amount in a highlighted box
    doc.setFillColor(240, 240, 240)
    doc.rect(20, finalY + 10, 170, 20, "F")

    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Total Amount Received:", 30, finalY + 22)
    doc.text(formatCurrency(payment.amount), 170, finalY + 22, { align: "right" })

    // Add notes if available
    if (payment.notes) {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("Notes:", 20, finalY + 40)

      doc.setFontSize(10)
      doc.setFont("helvetica", "normal")
      doc.text(payment.notes, 20, finalY + 45)
    }

    // Add thank you message
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("Thank You For Your Payment!", doc.internal.pageSize.getWidth() / 2, finalY + 60, {
      align: "center",
    })

    // Add footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(
        `This receipt is proof of payment | Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      )
    }

    // Return the PDF as a blob
    return doc.output("blob")
  },
}
