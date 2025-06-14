import { Resend } from "resend"
import type { InvoiceWithDetails } from "@/types/invoices"
import type { PaymentWithDetails } from "@/types/payments"

// Email templates
import InvoiceEmail from "@/emails/invoice-email"
import PaymentReceiptEmail from "@/emails/payment-receipt-email"
import PaymentReminderEmail from "@/emails/payment-reminder-email"
import ChangeOrderApprovalEmail from "@/emails/change-order-approval-email" // Import new email template

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export const emailService = {
  /**
   * Send an invoice email
   */
  async sendInvoiceEmail(
    invoice: InvoiceWithDetails,
    recipientEmail: string,
    options: {
      includeLink?: boolean
      includePdf?: boolean
      message?: string
    } = {},
  ): Promise<void> {
    try {
      // Generate the invoice PDF if requested
      let pdfAttachment = null
      if (options.includePdf) {
        const { pdfService } = await import("./pdf-service")
        const pdfBlob = await pdfService.generateInvoicePdf(invoice)
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

        pdfAttachment = {
          filename: `Invoice_${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        }
      }

      // Prepare email data
      const { data, error } = await resend.emails.send({
        from: `HomePro One <${process.env.EMAIL_FROM || "invoices@homeproone.com"}>`,
        to: [recipientEmail],
        subject: `Invoice #${invoice.invoice_number} for ${invoice.project.project_name}`,
        react: InvoiceEmail({
          invoice,
          recipientName:
            invoice.person.business_name ||
            `${invoice.person.first_name || ""} ${invoice.person.last_name || ""}`.trim(),
          message: options.message,
          viewInvoiceUrl: options.includeLink ? `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}` : undefined,
          payInvoiceUrl: options.includeLink
            ? `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/pay`
            : undefined,
        }),
        attachments: pdfAttachment ? [pdfAttachment] : undefined,
      })

      if (error) {
        throw new Error(`Failed to send invoice email: ${error.message}`)
      }
    } catch (error) {
      console.error("Error sending invoice email:", error)
      throw new Error(`Failed to send invoice email: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  /**
   * Send a payment receipt email
   */
  async sendPaymentReceiptEmail(
    payment: PaymentWithDetails,
    recipientEmail: string,
    options: {
      includeLink?: boolean
      includePdf?: boolean
      message?: string
    } = {},
  ): Promise<void> {
    try {
      // Generate the receipt PDF if requested
      let pdfAttachment = null
      if (options.includePdf) {
        const { pdfService } = await import("./pdf-service")
        const pdfBlob = await pdfService.generatePaymentReceiptPdf(payment)
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

        pdfAttachment = {
          filename: `Receipt_${payment.reference_number || payment.id}.pdf`,
          content: pdfBuffer,
        }
      }

      // Send the email
      const { data, error } = await resend.emails.send({
        from: `HomePro One <${process.env.EMAIL_FROM || "receipts@homeproone.com"}>`,
        to: [recipientEmail],
        subject: `Payment Receipt for Invoice #${payment.invoice.invoice_number}`,
        react: PaymentReceiptEmail({
          payment,
          recipientName:
            payment.person.business_name ||
            `${payment.person.first_name || ""} ${payment.person.last_name || ""}`.trim(),
          message: options.message,
          viewInvoiceUrl: options.includeLink
            ? `${process.env.NEXT_PUBLIC_API_URL}/invoices/${payment.invoice_id}`
            : undefined,
        }),
        attachments: pdfAttachment ? [pdfAttachment] : undefined,
      })

      if (error) {
        throw new Error(`Failed to send payment receipt email: ${error.message}`)
      }
    } catch (error) {
      console.error("Error sending payment receipt email:", error)
      throw new Error(`Failed to send payment receipt email: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  /**
   * Send a payment reminder email
   */
  async sendPaymentReminderEmail(
    invoice: InvoiceWithDetails,
    recipientEmail: string,
    options: {
      includeLink?: boolean
      includePdf?: boolean
      message?: string
      daysOverdue?: number
    } = {},
  ): Promise<void> {
    try {
      // Generate the invoice PDF if requested
      let pdfAttachment = null
      if (options.includePdf) {
        const { pdfService } = await import("./pdf-service")
        const pdfBlob = await pdfService.generateInvoicePdf(invoice)
        const pdfBuffer = Buffer.from(await pdfBlob.arrayBuffer())

        pdfAttachment = {
          filename: `Invoice_${invoice.invoice_number}.pdf`,
          content: pdfBuffer,
        }
      }

      // Send the email
      const { data, error } = await resend.emails.send({
        from: `HomePro One <${process.env.EMAIL_FROM || "reminders@homeproone.com"}>`,
        to: [recipientEmail],
        subject: `Payment Reminder: Invoice #${invoice.invoice_number} is ${options.daysOverdue ? `${options.daysOverdue} days ` : ""}overdue`,
        react: PaymentReminderEmail({
          invoice,
          recipientName:
            invoice.person.business_name ||
            `${invoice.person.first_name || ""} ${invoice.person.last_name || ""}`.trim(),
          message: options.message,
          daysOverdue: options.daysOverdue,
          viewInvoiceUrl: options.includeLink ? `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}` : undefined,
          payInvoiceUrl: options.includeLink
            ? `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/pay`
            : undefined,
        }),
        attachments: pdfAttachment ? [pdfAttachment] : undefined,
      })

      if (error) {
        throw new Error(`Failed to send payment reminder email: ${error.message}`)
      }
    } catch (error) {
      console.error("Error sending payment reminder email:", error)
      throw new Error(
        `Failed to send payment reminder email: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  },

  /**
   * Send a change order approval request email
   */
  async sendChangeOrderApprovalRequestEmail(
    changeOrder: {
      id: string;
      change_order_number: string | null;
      title: string;
      description: string | null;
      project_id: string;
      person_id: string;
    },
    recipientEmail: string,
    customerName: string,
    projectName: string,
    options: {
      message?: string;
    } = {},
  ): Promise<void> {
    try {
      const reviewUrl = `${process.env.NEXT_PUBLIC_API_URL}/client-portal/change-orders/${changeOrder.id}/review`;

      const { data, error } = await resend.emails.send({
        from: `HomePro One <${process.env.EMAIL_FROM || "notifications@homeproone.com"}>`,
        to: [recipientEmail],
        subject: `Action Required: Review Change Order #${changeOrder.change_order_number} for ${projectName}`,
        react: ChangeOrderApprovalEmail({
          customerName,
          projectName,
          changeOrderNumber: changeOrder.change_order_number || "N/A",
          changeOrderTitle: changeOrder.title,
          changeOrderDescription: changeOrder.description || "",
          reviewUrl,
          message: options.message,
        }),
      });

      if (error) {
        throw new Error(`Failed to send change order approval email: ${error.message}`);
      }
    } catch (error) {
      console.error("Error sending change order approval email:", error);
      throw new Error(
        `Failed to send change order approval email: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
}
