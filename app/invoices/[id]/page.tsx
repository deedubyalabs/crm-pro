import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getInvoiceById } from "@/lib/invoices"
import { ArrowLeft, FileEdit, Printer } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Invoice Details | PROActive OS",
  description: "View invoice details",
}

export default async function InvoiceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const invoice = await getInvoiceById(params.id)

  if (!invoice) {
    notFound()
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Draft":
        return "bg-gray-200 text-gray-800"
      case "Sent":
        return "bg-blue-100 text-blue-800"
      case "Partially Paid":
        return "bg-yellow-100 text-yellow-800"
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Overdue":
        return "bg-red-100 text-red-800"
      case "Void":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPersonName = () => {
    if (invoice.person.business_name) {
      return invoice.person.business_name
    }

    const firstName = invoice.person.first_name || ""
    const lastName = invoice.person.last_name || ""

    return `${firstName} ${lastName}`.trim() || "Unknown"
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/invoices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Invoices
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Invoice {invoice.invoice_number || "Draft"}</h1>
          <Badge className={getStatusBadgeColor(invoice.status)}>{invoice.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/invoices/${invoice.id}/edit`}>
              <FileEdit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Invoice Number</p>
                <p>{invoice.invoice_number || "Draft"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <Badge className={getStatusBadgeColor(invoice.status)}>{invoice.status}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                <p>{invoice.issue_date ? new Date(invoice.issue_date).toLocaleDateString() : "Not set"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Date</p>
                <p>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "Not set"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project</p>
              <p>{invoice.project.project_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Client</p>
              <p>{getPersonName()}</p>
            </div>
            {invoice.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notes</p>
                <p className="whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                <div className="col-span-6">Description</div>
                <div className="col-span-1 text-right">Qty</div>
                <div className="col-span-2">Unit</div>
                <div className="col-span-1 text-right">Price</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              <Separator />

              {invoice.line_items.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">No line items</div>
              ) : (
                <div className="space-y-2">
                  {invoice.line_items
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((item) => (
                      <div key={item.id} className="grid grid-cols-12 gap-2">
                        <div className="col-span-6">{item.description}</div>
                        <div className="col-span-1 text-right">{item.quantity}</div>
                        <div className="col-span-2">{item.unit}</div>
                        <div className="col-span-1 text-right">{formatCurrency(item.unit_price)}</div>
                        <div className="col-span-2 text-right">{formatCurrency(item.total)}</div>
                      </div>
                    ))}
                </div>
              )}

              <Separator />

              <div className="flex justify-between font-medium">
                <div>Subtotal</div>
                <div>{formatCurrency(invoice.total_amount)}</div>
              </div>

              <div className="flex justify-between font-medium">
                <div>Amount Paid</div>
                <div>{formatCurrency(invoice.amount_paid)}</div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <div>Balance Due</div>
                <div>{formatCurrency(invoice.total_amount - invoice.amount_paid)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
