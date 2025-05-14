"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form } from "@/components/ui/form"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const sendReceiptSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
  message: z.string().optional(),
  includePdf: z.boolean().default(true),
  includeInvoiceLink: z.boolean().default(true),
})

type SendReceiptFormValues = z.infer<typeof sendReceiptSchema>

export default function SendReceiptForm({ payment }: { payment: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<SendReceiptFormValues>({
    resolver: zodResolver(sendReceiptSchema),
    defaultValues: {
      recipientEmail: "",
      message: "",
      includePdf: true,
      includeInvoiceLink: true,
    },
  })

  const onSubmit = async (data: SendReceiptFormValues) => {
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)
    
    try {
      const response = await fetch(`/api/payments/${payment.id}/send-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send receipt")
      }
      
      setSuccess(true)
      form.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Send Payment Receipt</CardTitle>
            <CardDescription>
              Send a receipt for payment on Invoice #{payment.invoice.invoice_number
