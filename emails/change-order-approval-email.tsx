import { Html, Head, Body, Container, Text, Link, Img, Section, Row, Column, Hr } from "@react-email/components"
import * as React from "react"

interface ChangeOrderApprovalEmailProps {
  customerName: string;
  projectName: string;
  changeOrderNumber: string;
  changeOrderTitle: string;
  changeOrderDescription: string;
  reviewUrl: string;
  message?: string;
}

export const ChangeOrderApprovalEmail = ({
  customerName,
  projectName,
  changeOrderNumber,
  changeOrderTitle,
  changeOrderDescription,
  reviewUrl,
  message,
}: ChangeOrderApprovalEmailProps) => (
  <Html>
    <Head />
    <Body style={main}>
      <Container style={container}>
        <Section style={box}>
          <Img src={`${process.env.NEXT_PUBLIC_API_URL}/placeholder-logo.png`} width="100" height="auto" alt="HomePro One" style={logo} />
          <Hr style={hr} />
          <Text style={paragraph}>Dear {customerName},</Text>
          <Text style={paragraph}>
            A new Change Order (No. {changeOrderNumber}) for your project "{projectName}" has been submitted for your review and approval.
          </Text>
          <Text style={paragraph}>
            <strong>Change Order Title:</strong> {changeOrderTitle}
          </Text>
          <Text style={paragraph}>
            <strong>Description:</strong> {changeOrderDescription}
          </Text>
          {message && <Text style={paragraph}>{message}</Text>}
          <Text style={paragraph}>
            Please review the details of this change order and provide your electronic signature to approve or reject it.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={reviewUrl}>
              Review Change Order
            </Link>
          </Section>
          <Text style={paragraph}>
            If you have any questions, please do not hesitate to contact us.
          </Text>
          <Text style={paragraph}>Best regards,</Text>
          <Text style={paragraph}>The HomePro One Team</Text>
          <Hr style={hr} />
          <Text style={footer}>HomePro One</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ChangeOrderApprovalEmail

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const logo = {
  margin: "0 auto",
}

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
}

const box = {
  padding: "0 48px",
}

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
}

const paragraph = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
}

const buttonContainer = {
  textAlign: "center" as const,
  padding: "20px 0",
}

const button = {
  backgroundColor: "#007bff",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 24px",
}

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
}
