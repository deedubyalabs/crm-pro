import { v4 as uuidv4 } from "uuid"
import { supabase, handleSupabaseError } from "./supabase"
import type { Invoice } from "@/types/invoices"
import type { Payment } from "@/types/payments"

// Square API client configuration
const squareApiUrl = process.env.NEXT_PUBLIC_SQUARE_API_URL || "https://connect.squareup.com/v2"
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN
const squareLocationId = process.env.SQUARE_LOCATION_ID
const squareAppId = process.env.NEXT_PUBLIC_SQUARE_APP_ID

export const squareService = {
  /**
   * Create a payment link for an invoice
   */
  async createPaymentLink(
    invoice: Invoice,
    customerEmail: string,
    customerPhone?: string,
    redirectUrl?: string,
  ): Promise<{ paymentLinkUrl: string; paymentLinkId: string }> {
    if (!squareAccessToken) {
      throw new Error("Square access token is not configured")
    }

    if (!squareLocationId) {
      throw new Error("Square location ID is not configured")
    }

    try {
      // Create a unique idempotency key for this request
      const idempotencyKey = uuidv4()

      // Format the invoice details for Square
      const orderRequest = {
        idempotency_key: idempotencyKey,
        order: {
          location_id: squareLocationId,
          reference_id: invoice.invoice_number,
          customer_id: await this.getOrCreateCustomer(invoice.person_id, customerEmail, customerPhone),
          line_items: [
            {
              name: `Invoice #${invoice.invoice_number}`,
              quantity: "1",
              base_price_money: {
                amount: Math.round(invoice.total_amount * 100), // Square uses cents
                currency: "USD",
              },
            },
          ],
          metadata: {
            invoice_id: invoice.id,
            project_id: invoice.project_id,
          },
        },
      }

      // Create the order in Square
      const orderResponse = await fetch(`${squareApiUrl}/orders`, {
        method: "POST",
        headers: {
          "Square-Version": "2023-09-25",
          Authorization: `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequest),
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(`Failed to create Square order: ${JSON.stringify(errorData)}`)
      }

      const orderData = await orderResponse.json()
      const orderId = orderData.order.id

      // Create a payment link for the order
      const paymentLinkRequest = {
        idempotency_key: uuidv4(),
        description: `Payment for Invoice #${invoice.invoice_number}`,
        quick_pay: {
          name: `Invoice #${invoice.invoice_number}`,
          price_money: {
            amount: Math.round(invoice.total_amount * 100), // Square uses cents
            currency: "USD",
          },
          location_id: squareLocationId,
        },
        checkout_options: {
          redirect_url: redirectUrl || `${process.env.NEXT_PUBLIC_API_URL}/invoices/${invoice.id}/payment-confirmation`,
          ask_for_shipping_address: false,
          allow_tipping: false,
          custom_fields: [
            {
              title: "Invoice Number",
              type: "TEXT",
              required: false,
              default_value: invoice.invoice_number || "",
            },
          ],
        },
        pre_populated_data: {
          buyer_email: customerEmail,
          buyer_phone_number: customerPhone,
        },
        payment_note: `Payment for Invoice #${invoice.invoice_number}`,
        order_id: orderId,
      }

      const paymentLinkResponse = await fetch(`${squareApiUrl}/online-checkout/payment-links`, {
        method: "POST",
        headers: {
          "Square-Version": "2023-09-25",
          Authorization: `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentLinkRequest),
      })

      if (!paymentLinkResponse.ok) {
        const errorData = await paymentLinkResponse.json()
        throw new Error(`Failed to create Square payment link: ${JSON.stringify(errorData)}`)
      }

      const paymentLinkData = await paymentLinkResponse.json()
      const paymentLinkUrl = paymentLinkData.payment_link.url
      const paymentLinkId = paymentLinkData.payment_link.id

      // Store the payment link information in the database
      await supabase.from("square_payment_links").insert({
        id: paymentLinkId,
        invoice_id: invoice.id,
        order_id: orderId,
        payment_link_url: paymentLinkUrl,
        amount: invoice.total_amount,
        status: "PENDING",
        customer_email: customerEmail,
        customer_phone: customerPhone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      return {
        paymentLinkUrl,
        paymentLinkId,
      }
    } catch (error) {
      console.error("Error creating Square payment link:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Get or create a customer in Square
   */
  async getOrCreateCustomer(personId: string, email: string, phone?: string): Promise<string> {
    if (!squareAccessToken) {
      throw new Error("Square access token is not configured")
    }

    try {
      // Check if we already have a Square customer ID for this person
      const { data: personData, error: personError } = await supabase
        .from("people")
        .select("square_customer_id, first_name, last_name, business_name")
        .eq("id", personId)
        .single()

      if (personError) throw personError

      // If we already have a Square customer ID, return it
      if (personData.square_customer_id) {
        return personData.square_customer_id
      }

      // Otherwise, create a new customer in Square
      const customerRequest = {
        idempotency_key: uuidv4(),
        given_name: personData.first_name || "",
        family_name: personData.last_name || "",
        company_name: personData.business_name || "",
        email_address: email,
        phone_number: phone,
        reference_id: personId,
      }

      const customerResponse = await fetch(`${squareApiUrl}/customers`, {
        method: "POST",
        headers: {
          "Square-Version": "2023-09-25",
          Authorization: `Bearer ${squareAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerRequest),
      })

      if (!customerResponse.ok) {
        const errorData = await customerResponse.json()
        throw new Error(`Failed to create Square customer: ${JSON.stringify(errorData)}`)
      }

      const customerData = await customerResponse.json()
      const customerId = customerData.customer.id

      // Update the person record with the Square customer ID
      await supabase
        .from("people")
        .update({ square_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", personId)

      return customerId
    } catch (error) {
      console.error("Error getting or creating Square customer:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Process a Square webhook notification
   */
  async processWebhook(payload: any): Promise<void> {
    try {
      const eventType = payload.type
      const data = payload.data

      if (eventType === "payment.updated") {
        const paymentId = data.id
        const status = data.object.payment.status
        const orderId = data.object.payment.order_id

        if (status === "COMPLETED") {
          // Find the invoice associated with this payment
          const { data: paymentLinkData, error: paymentLinkError } = await supabase
            .from("square_payment_links")
            .select("invoice_id, amount")
            .eq("order_id", orderId)
            .single()

          if (paymentLinkError) throw paymentLinkError

          const invoiceId = paymentLinkData.invoice_id
          const amount = paymentLinkData.amount

          // Get the invoice details
          const { data: invoiceData, error: invoiceError } = await supabase
            .from("invoices")
            .select("project_id, person_id")
            .eq("id", invoiceId)
            .single()

          if (invoiceError) throw invoiceError

          // Record the payment
          const paymentData: Omit<Payment, "id" | "created_at" | "updated_at"> = {
            invoice_id: invoiceId,
            project_id: invoiceData.project_id,
            person_id: invoiceData.person_id,
            amount: amount,
            payment_date: new Date().toISOString(),
            payment_method: "square",
            reference_number: paymentId,
            square_payment_id: paymentId,
            square_receipt_url: data.object.payment.receipt_url,
            notes: "Payment processed through Square",
            created_by_user_id: null,
          }

          // Create the payment record
          await supabase.from("payments").insert({
            ...paymentData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          // Update the invoice with the new payment amount
          const { data: invoice, error: getInvoiceError } = await supabase
            .from("invoices")
            .select("amount_paid, total_amount")
            .eq("id", invoiceId)
            .single()

          if (getInvoiceError) throw getInvoiceError

          const newAmountPaid = (invoice.amount_paid || 0) + amount
          const newStatus = newAmountPaid >= invoice.total_amount ? "Paid" : "Partially Paid"

          await supabase
            .from("invoices")
            .update({
              amount_paid: newAmountPaid,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", invoiceId)

          // Update the payment link status
          await supabase
            .from("square_payment_links")
            .update({
              status: "COMPLETED",
              payment_id: paymentId,
              updated_at: new Date().toISOString(),
            })
            .eq("order_id", orderId)
        }
      }
    } catch (error) {
      console.error("Error processing Square webhook:", error)
      throw new Error(handleSupabaseError(error))
    }
  },

  /**
   * Get Square payment form configuration
   */
  getPaymentFormConfig() {
    if (!squareAppId || !squareLocationId) {
      throw new Error("Square configuration is incomplete")
    }

    return {
      applicationId: squareAppId,
      locationId: squareLocationId,
    }
  },
}
