import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Download, Send, Check, X } from "lucide-react"
import { estimateService } from "@/lib/estimates"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PaymentScheduleList } from "../payment-schedule-list"
import { CreateProjectButton } from "./create-bid-button" // Updated import name

export const metadata: Metadata = {
  title: "Estimate Details | PROActive OS",
  description: "View estimate details",
}

export default async function EstimateDetailPage({ params }: { params: { id: string } }) {
  // Handle the "new" route parameter by redirecting to the new estimate page
  if (params.id === "new") {
    redirect("/estimates/new")
  }

  const estimate = await estimateService.getEstimateById(params.id)

  if (!estimate) {
    notFound()
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            Draft
          </Badge>
        )
      case "Sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Sent
          </Badge>
        )
      case "Accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Accepted
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Rejected
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/estimates">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Estimate {estimate.estimate_number || "(Draft)"}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(estimate.status)}
              <span className="text-sm text-muted-foreground">Created {formatDate(estimate.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {estimate.status === "Draft" && (
            <>
              <Button variant="outline" asChild>
                <Link href={`/estimates/${estimate.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
              <Button>
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </>
          )}
          {estimate.status === "Sent" && (
            <>
              <Button variant="outline">
                <X className="mr-2 h-4 w-4" />
                Mark as Rejected
              </Button>
              <Button variant="outline">
                <Check className="mr-2 h-4 w-4" />
                Mark as Accepted
              </Button>
            </>
          )}
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {/* Conditionally render the Create Project button if the estimate is accepted */}
          {estimate.status === "Accepted" && (
            <CreateProjectButton estimateId={estimate.id} />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                <Link href={`/people/${estimate.person.id}`} className="hover:underline">
                  {estimate.person.name}
                </Link>
              </p>
              {estimate.person.email && <p>{estimate.person.email}</p>}
              {estimate.person.phone && <p>{estimate.person.phone}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                {estimate.opportunity ? (
                  <Link href={`/opportunities/${estimate.opportunity.id}`} className="hover:underline">
                    {estimate.opportunity.opportunity_name}
                  </Link>
                ) : (
                  <span>No opportunity linked</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estimate Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getStatusBadge(estimate.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Issue Date:</span>
                <span>{estimate.issue_date ? formatDate(estimate.issue_date) : "Not issued"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Expiration:</span>
                <span>{estimate.expiration_date ? formatDate(estimate.expiration_date) : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-bold">{formatCurrency(estimate.total_amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Unit Cost</TableHead>
                <TableHead className="text-right">Markup</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estimate.lineItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No line items found.
                  </TableCell>
                </TableRow>
              ) : (
                estimate.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {item.description}
                      {item.costItem && (
                        <div className="text-xs text-muted-foreground mt-1">Item Code: {item.costItem.item_code}</div>
                      )}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                    <TableCell className="text-right">{item.markup}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-6">
            <div className="w-1/3 space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Subtotal:</span>
                <span>{formatCurrency(estimate.subtotal_amount || estimate.total_amount)}</span>
              </div>
              {estimate.discount_type && estimate.discount_value && (
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">
                    Discount {estimate.discount_type === "percentage" ? `(${estimate.discount_value}%)` : ""}:
                  </span>
                  <span>
                    -
                    {formatCurrency(
                      estimate.discount_type === "percentage"
                        ? (estimate.subtotal_amount * estimate.discount_value) / 100
                        : estimate.discount_value,
                    )}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium">Tax:</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(estimate.total_amount)}</span>
              </div>
            </div>
          </div>

          {estimate.notes && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Notes</h3>
              <p className="text-muted-foreground whitespace-pre-line">{estimate.notes}</p>
            </div>
          )}

          {estimate.deposit_required && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-medium mb-2">Deposit Required</h3>
              <p className="text-muted-foreground">
                {estimate.deposit_percentage
                  ? `${estimate.deposit_percentage}% (${formatCurrency((estimate.total_amount * estimate.deposit_percentage) / 100)})`
                  : formatCurrency(estimate.deposit_amount || 0)}
              </p>
            </div>
          )}

          {estimate.paymentSchedules && estimate.paymentSchedules.length > 0 && (
            <PaymentScheduleList paymentSchedules={estimate.paymentSchedules} totalAmount={estimate.total_amount} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
