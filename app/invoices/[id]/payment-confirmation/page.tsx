import { redirect } from "next/navigation"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getInvoiceById } from "@/lib/invoices"
import Link from "next/link"

export default async function PaymentConfirmationPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { status?: string }
}) {
  const invoiceId = params.id
  const awaitedSearchParams = await searchParams;
  const status = awaitedSearchParams.status || "success" // Default to success if not provided

  const invoice = await getInvoiceById(invoiceId)
  if (!invoice) {
    redirect("/invoices")
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Payment {status === "success" ? "Successful" : "Failed"}</CardTitle>
          <CardDescription>Invoice #{invoice.invoice_number}</CardDescription>
        </CardHeader>
        <CardContent>
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Thank You for Your Payment</h3>
              <p className="text-center text-muted-foreground">
                Your payment has been processed successfully. A receipt has been sent to your email.
              </p>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Failed</AlertTitle>
              <AlertDescription>
                There was an issue processing your payment. Please try again or contact us for assistance.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href={`/invoices/${invoiceId}`}>Return to Invoice</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
