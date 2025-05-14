"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { squareService } from "@/lib/square-service"
import { formatCurrency } from "@/lib/utils"

declare global {
  interface Window {
    Square: any
  }
}

const squarePaymentSchema = z.object({
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
})

type SquarePaymentFormValues = z.infer<typeof squarePaymentSchema>

export default function SquarePayment({ invoice }: { invoice: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const form = useForm<SquarePaymentFormValues>({
    resolver: zodResolver(squarePaymentSchema),
    defaultValues: {
      email: "",
      phone: "",
    },
  })

  const onSubmit = async (data: SquarePaymentFormValues) => {
    setIsLoading(true)
    setPaymentStatus("loading")
    try {
      const { paymentLinkUrl } = await squareService.createPaymentLink(
        invoice,
        data.email,
        data.phone || undefined,
        `${window.location.origin}/invoices/${invoice.id}/payment-confirmation`,
      )

      setPaymentLink(paymentLinkUrl)
      setPaymentStatus("success")
    } catch (error) {
      console.error("Error creating Square payment link:", error)
      setErrorMessage(error instanceof Error ? error.message : "Failed to create payment link")
      setPaymentStatus("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Pay with Square</CardTitle>
            <CardDescription>Process a secure online payment for Invoice #{invoice.invoice_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentStatus === "idle" || paymentStatus === "loading" ? (
              <>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold">
                    {formatCurrency(invoice.total_amount - (invoice.amount_paid || 0))}
                  </div>
                  <div className="text-sm text-muted-foreground">Amount Due</div>
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="customer@example.com" {...field} />
                      </FormControl>
                      <FormDescription>Payment receipt will be sent to this email</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 555-5555" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : paymentStatus === "success" ? (
              <div className="flex flex-col items-center justify-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-medium mb-2">Payment Link Created</h3>
                <p className="text-center text-muted-foreground mb-6">
                  A secure payment link has been created. Click the button below to proceed to the payment page.
                </p>
                <Button asChild className="w-full">
                  <a href={paymentLink!} target="_blank" rel="noopener noreferrer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </a>
                </Button>
              </div>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {errorMessage || "There was an error creating the payment link. Please try again."}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          {(paymentStatus === "idle" || paymentStatus === "loading") && (
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <CreditCard className="mr-2 h-4 w-4" />
                Create Payment Link
              </Button>
            </CardFooter>
          )}
        </Card>
      </form>
    </Form>
  )
}
