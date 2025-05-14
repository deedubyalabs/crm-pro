import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
  Hr,
  Column,
  Row,
} from "@react-email/components"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { InvoiceWithDetails } from "@/types/invoices"

interface InvoiceEmailProps {
  invoice: InvoiceWithDetails
  recipientName: string
  message?: string
  viewInvoiceUrl?: string
  payInvoiceUrl?: string
}

export default function InvoiceEmail({
  invoice,
  recipientName,
  message,
  viewInvoiceUrl,
  payInvoiceUrl,
}: InvoiceEmailProps) {
  const previewText = `Invoice #${invoice.invoice_number} for ${invoice.project.project_name}`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${process.env.NEXT_PUBLIC_API_URL}/logo.png`}
              width="150"
              height="50"
              alt="HomePro One"
              style={logo}
            />
          </Section>
          <Section style={content}>
            <Heading style={heading}>Invoice #{invoice.invoice_number}</Heading>

            <Text style={paragraph}>Dear {recipientName},</Text>

            <Text style={paragraph}>
              Please find attached your invoice for the project: <strong>{invoice.project.project_name}</strong>.
            </Text>

            {message && <Text style={paragraph}>{message}</Text>}

            <Section style={invoiceInfoContainer}>
              <Row>
                <Column>
                  <Text style={invoiceInfoLabel}>Invoice Date:</Text>
                  <Text style={invoiceInfoValue}>{formatDate(invoice.issue_date)}</Text>
                </Column>
                <Column>
                  <Text style={invoiceInfoLabel}>Due Date:</Text>
                  <Text style={invoiceInfoValue}>{formatDate(invoice.due_date)}</Text>
                </Column>
                <Column>
                  <Text style={invoiceInfoLabel}>Amount Due:</Text>
                  <Text style={invoiceInfoValue}>
                    {formatCurrency(invoice.total_amount - (invoice.amount_paid || 0))}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section style={ctaContainer}>
              {viewInvoiceUrl && (
                <Button style={viewButton} href={viewInvoiceUrl}>
                  View Invoice
                </Button>
              )}

              {payInvoiceUrl && (
                <Button style={payButton} href={payInvoiceUrl}>
                  Pay Now
                </Button>
              )}
            </Section>

            <Hr style={divider} />

            <Text style={paragraph}>
              If you have any questions about this invoice, please contact us at{" "}
              <Link href="mailto:billing@homeproone.com" style={link}>
                billing@homeproone.com
              </Link>{" "}
              or call us at (555) 555-5555.
            </Text>

            <Text style={paragraph}>Thank you for your business!</Text>

            <Text style={signature}>
              Sincerely,
              <br />
              The HomePro One Team
            </Text>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>© {new Date().getFullYear()} HomePro One. All rights reserved.</Text>
            <Text style={footerText}>123 Main Street, Anytown, CA 12345</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0",
  maxWidth: "600px",
}

const logoContainer = {
  padding: "20px",
}

const logo = {
  margin: "0 auto",
}

const content = {
  padding: "0 20px",
}

const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#333",
  padding: "0",
  margin: "0 0 20px",
}

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333",
}

const invoiceInfoContainer = {
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
}

const invoiceInfoLabel = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
  padding: "0",
}

const invoiceInfoValue = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#333",
  margin: "0 0 10px",
  padding: "0",
}

const ctaContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
}

const viewButton = {
  backgroundColor: "#f6f9fc",
  borderRadius: "4px",
  color: "#333",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 20px",
  margin: "0 10px",
  border: "1px solid #ddd",
}

const payButton = {
  backgroundColor: "#4f46e5",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 20px",
  margin: "0 10px",
}

const divider = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const link = {
  color: "#4f46e5",
  textDecoration: "underline",
}

const signature = {
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#333",
  margin: "20px 0 0",
}

const footer = {
  textAlign: "center" as const,
  padding: "20px",
  backgroundColor: "#f6f9fc",
  borderTop: "1px solid #e6ebf1",
}

const footerText = {
  fontSize: "12px",
  color: "#666",
  margin: "5px 0",
}
