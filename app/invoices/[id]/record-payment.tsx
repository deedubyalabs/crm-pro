"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, CreditCard, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { financialService } from "@/lib/financial-service"
import { formatCurrency } from "@/lib/utils"

const paymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  payment_date: z.date(),
  payment_method: z.string().min(1, "Payment method is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

export default function RecordPaymentForm({ invoice }: { invoice: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSquarePayment, setShowSquarePayment] = useState(false)

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: invoice.total_amount - (invoice.amount_paid || 0),
      payment_date: new Date(),
      payment_method: "cash",
    },
  })

  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true)
    try {
      await financialService.recordPayment(invoice.id, {
        amount: data.amount,
        payment_date: data.payment_date.toISOString(),
        payment_method: data.payment_method,
        reference_number: data.reference_number,
        notes: data.notes,
      })

      router.refresh()
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      console.error("Error recording payment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingAmount = invoice.total_amount - (invoice.amount_paid || 0)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Record Payment</CardTitle>
            <CardDescription>Record a payment for Invoice #{invoice.invoice_number}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0.01" max={remainingAmount} {...field} />
                    </FormControl>
                    <FormDescription>Remaining balance: {formatCurrency(remainingAmount)}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Payment Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      setShowSquarePayment(value === "square")
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="check">Check</SelectItem>
                      <SelectItem value="credit_card">Credit Card (Manual)</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="square">Square Payment</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {showSquarePayment && (
              <div className="bg-muted p-4 rounded-md">
                <h3 className="text-sm font-medium mb-2">Square Payment Integration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Process a payment through Square. This will send a payment link to the customer's email.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Customer Email</label>
                      <Input type="email" placeholder="customer@example.com" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone (Optional)</label>
                      <Input type="tel" placeholder="(555) 555-5555" />
                    </div>
                  </div>
                  <Button type="button" className="w-full" variant="outline">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Send Square Payment Link
                  </Button>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reference Number</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Check #, Transaction ID, etc." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional notes about this payment"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <DollarSign className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
