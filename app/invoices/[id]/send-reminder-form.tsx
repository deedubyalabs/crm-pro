"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const sendReminderSchema = z.object({
  recipientEmail: z.string().email("Valid email is required"),
  message: z.string().optional(),
  includePdf: z.boolean().default(true),
  includePaymentLink: z.boolean().default(true),
})

type SendReminderFormValues = z.infer<typeof sendReminderSchema>

export default function SendReminderForm({ invoice }: { invoice: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Calculate days overdue if due date exists
  const daysOverdue = invoice.due_date
    ? Math.max(0, Math.floor((new Date().getTime() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)))
    : undefined

  const form = useForm<SendReminderFormValues>({
    resolver: zodResolver(sendReminderSchema),
    defaultValues: {
      recipientEmail: "",
      message: "",
      includePdf: true,
      includePaymentLink: true,
    },
  })

  const onSubmit = async (data: SendReminderFormValues) => {
    setIsSubmitting(true)
    setSuccess(false)
    setError(null)

    try {
      const response = await fetch(`/api/invoices/${invoice.id}/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          daysOverdue,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send reminder")
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
            <CardTitle>Send Payment Reminder</CardTitle>
            <CardDescription>
              Send a payment reminder for Invoice #{invoice.invoice_number}
              {daysOverdue ? ` (${daysOverdue} days overdue)` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200 mb-4">
                <AlertTitle>Reminder Sent Successfully</AlertTitle>
                <AlertDescription>The payment reminder has been sent to the recipient.</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Email</FormLabel>
                  <FormControl>
                    <Input placeholder="customer@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional message to include in the reminder"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormField
                control={form.control}
                name="includePdf"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Attach PDF</FormLabel>
                      <FormDescription>Include a PDF copy of the invoice as an attachment</FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includePaymentLink"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Include Payment Link</FormLabel>
                      <FormDescription>Add a link to pay the invoice online</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Bell className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
