import { notFound } from "next/navigation"
import { paymentService } from "@/lib/payments"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import ReceiptDownloadButton from "./receipt-download-button"
import Link from "next/link"

export default async function PaymentDetailsPage({ params }: { params: { id: string } }) {
  const payment = await paymentService.getPaymentById(params.id)

  if (!payment) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Payment Details</h1>
        <ReceiptDownloadButton paymentId={payment.id} referenceNumber={payment.reference_number} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Payment Information</CardTitle>
            <CardDescription>Details about this payment</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Reference Number</dt>
                <dd className="text-lg font-semibold">{payment.reference_number || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Payment Date</dt>
                <dd className="text-lg font-semibold">{formatDate(payment.payment_date)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Amount</dt>
                <dd className="text-lg font-semibold">{formatCurrency(payment.amount)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
                <dd className="text-lg font-semibold">
                  <Badge variant="outline">
                    {payment.payment_method.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Invoice</dt>
                <dd className="text-lg font-semibold">
                  <Link href={`/invoices/${payment.invoice_id}`} className="hover:underline">
                    #{payment.invoice.invoice_number}
                  </Link>
                </dd>
              </div>
              {payment.square_payment_id && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Square Payment ID</dt>
                  <dd className="text-lg font-semibold">{payment.square_payment_id}</dd>
                </div>
              )}
              {payment.square_receipt_url && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Square Receipt</dt>
                  <dd className="text-lg font-semibold">
                    <a
                      href={payment.square_receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Receipt
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            {payment.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                <p className="text-sm">{payment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Client who made this payment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Client</h3>
                <p className="text-lg font-semibold">
                  {payment.person.business_name ||
                    `${payment.person.first_name || ""} ${payment.person.last_name || ""}`.trim()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Project</h3>
                <p className="text-lg font-semibold">
                  <Link href={`/projects/${payment.project_id}`} className="hover:underline">
                    {payment.project.project_name}
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
