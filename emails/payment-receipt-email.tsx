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
import type { PaymentWithDetails } from "@/types/payments"

interface PaymentReceiptEmailProps {
  payment: PaymentWithDetails
  recipientName: string
  message?: string
  viewInvoiceUrl?: string
}

export default function PaymentReceiptEmail({
  payment,
  recipientName,
  message,
  viewInvoiceUrl,
}: PaymentReceiptEmailProps) {
  const previewText = `Receipt for payment on Invoice #${payment.invoice.invoice_number}`

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
            <Heading style={heading}>Payment Receipt</Heading>

            <Text style={paragraph}>Dear {recipientName},</Text>

            <Text style={paragraph}>
              Thank you for your payment on Invoice #{payment.invoice.invoice_number} for the project:{" "}
              <strong>{payment.project.project_name}</strong>.
            </Text>

            {message && <Text style={paragraph}>{message}</Text>}

            <Section style={receiptInfoContainer}>
              <Row>
                <Column>
                  <Text style={receiptInfoLabel}>Payment Date:</Text>
                  <Text style={receiptInfoValue}>{formatDate(payment.payment_date)}</Text>
                </Column>
                <Column>
                  <Text style={receiptInfoLabel}>Payment Method:</Text>
                  <Text style={receiptInfoValue}>
                    {payment.payment_method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Text>
                </Column>
                <Column>
                  <Text style={receiptInfoLabel}>Amount Paid:</Text>
                  <Text style={receiptInfoValue}>{formatCurrency(payment.amount)}</Text>
                </Column>
              </Row>
              {payment.reference_number && (
                <Row>
                  <Column>
                    <Text style={receiptInfoLabel}>Reference Number:</Text>
                    <Text style={receiptInfoValue}>{payment.reference_number}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {viewInvoiceUrl && (
              <Section style={ctaContainer}>
                <Button style={viewButton} href={viewInvoiceUrl}>
                  View Invoice
                </Button>
              </Section>
            )}

            <Hr style={divider} />

            <Text style={paragraph}>
              If you have any questions about this payment, please contact us at{" "}
              <Link href="mailto:billing@homeproone.com" style={link}>
                billing@homeproone.com
              </Link>{" "}
              or call us at (555) 555-5555.
            </Text>

            <Text style={paragraph}>We appreciate your business!</Text>

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

const receiptInfoContainer = {
  backgroundColor: "#f9f9f9",
  borderRadius: "4px",
  padding: "15px",
  margin: "20px 0",
}

const receiptInfoLabel = {
  fontSize: "14px",
  color: "#666",
  margin: "0",
  padding: "0",
}

const receiptInfoValue = {
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
  backgroundColor: "#4f46e5",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "10px 20px",
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
