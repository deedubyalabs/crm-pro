import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Building, FileText, Send, Award, RefreshCw } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { biddingService } from "@/lib/bidding-service"
import { BidComparisonChart } from "./bid-comparison-chart"
import { UpdateEstimateButton } from "./update-estimate-button"

interface BidRequestPageProps {
  params: {
    id: string
  }
}

export default async function BidRequestPage({ params }: BidRequestPageProps) {
  const bidRequest = await biddingService.getBidRequestById(params.id)

  if (!bidRequest) {
    notFound()
  }

  // Get bid comparison if there are responses
  let bidComparison = null
  let itemComparisons = null
  if (bidRequest.responses.length > 0) {
    bidComparison = await biddingService.getBidComparison(bidRequest.id)
    itemComparisons = await biddingService.getBidItemComparison(bidRequest.id)
  }

  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>
      case "viewed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Viewed</Badge>
      case "responded":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Responded</Badge>
      case "awarded":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Awarded</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/bids">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bidRequest.title}</h1>
            <div className="flex items-center mt-1 space-x-2">
              {getStatusBadge(bidRequest.status)}
              <span className="text-sm text-muted-foreground">Created {formatDate(bidRequest.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          {bidRequest.status === "draft" && (
            <Button asChild>
              <Link href={`/bids/${bidRequest.id}/send`}>
                <Send className="mr-2 h-4 w-4" />
                Send to Subcontractors
              </Link>
            </Button>
          )}
          {bidRequest.status === "responded" && (
            <Button asChild>
              <Link href={`/bids/${bidRequest.id}/award`}>
                <Award className="mr-2 h-4 w-4" />
                Award Bid
              </Link>
            </Button>
          )}
          {bidRequest.status === "awarded" && bidRequest.estimate_id && (
            <UpdateEstimateButton
              bidRequestId={bidRequest.id}
              estimateId={bidRequest.estimate_id}
              awardedSubcontractorId={bidRequest.awarded_to || ""}
            />
          )}
          {bidRequest.status === "awarded" && bidRequest.change_order_id && (
            <Button asChild>
              <Link href={`/bids/${bidRequest.id}/update-change-order`}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Update Change Order
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium">
                <Link href={`/projects/${bidRequest.project.id}`} className="hover:underline flex items-center">
                  <Building className="mr-2 h-4 w-4" />
                  {bidRequest.project.project_name}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {bidRequest.estimate && (
          <Card>
            <CardHeader>
              <CardTitle>Source Estimate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  <Link href={`/estimates/${bidRequest.estimate.id}`} className="hover:underline flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    {bidRequest.estimate.estimate_number}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {bidRequest.changeOrder && (
          <Card>
            <CardHeader>
              <CardTitle>Source Change Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  <Link
                    href={`/change-orders/${bidRequest.changeOrder.id}`}
                    className="hover:underline flex items-center"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    {bidRequest.changeOrder.co_number}
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Bid Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span>{getStatusBadge(bidRequest.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Trade:</span>
                <span>
                  {bidRequest.trade_category
                    ? bidRequest.trade_category.charAt(0).toUpperCase() + bidRequest.trade_category.slice(1)
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date:</span>
                <span>{bidRequest.due_date ? formatDate(bidRequest.due_date) : "Not set"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sent Date:</span>
                <span>{bidRequest.sent_at ? formatDate(bidRequest.sent_at) : "Not sent"}</span>
              </div>
              {bidRequest.status === "awarded" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Awarded To:</span>
                  <span>
                    {bidRequest.responses.find((r) => r.subcontractor.id === bidRequest.awarded_to)?.subcontractor
                      .business_name || "Unknown Subcontractor"}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {bidRequest.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{bidRequest.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Bid Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Est. Unit Cost</TableHead>
                <TableHead className="text-right">Est. Total</TableHead>
                {itemComparisons && (
                  <>
                    <TableHead className="text-right">Lowest Bid</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidRequest.items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={itemComparisons ? 7 : 5} className="h-24 text-center">
                    No bid items found.
                  </TableCell>
                </TableRow>
              ) : (
                bidRequest.items.map((item) => {
                  const itemComparison = itemComparisons?.find((ic) => ic.bidItemId === item.id)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.description}
                        {item.estimateLineItem && (
                          <div className="text-xs text-muted-foreground mt-1">From Estimate Line Item</div>
                        )}
                        {item.changeOrderLineItem && (
                          <div className="text-xs text-muted-foreground mt-1">From Change Order Line Item</div>
                        )}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.estimated_cost || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.estimated_total || 0)}</TableCell>
                      {itemComparison && (
                        <>
                          <TableCell
                            className={`text-right ${itemComparison.isOverBudget ? "text-red-600" : "text-green-600"}`}
                          >
                            {formatCurrency(itemComparison.lowestBidPrice)}
                          </TableCell>
                          <TableCell
                            className={`text-right ${itemComparison.isOverBudget ? "text-red-600" : "text-green-600"}`}
                          >
                            {itemComparison.variancePercentage.toFixed(2)}%
                          </TableCell>
                        </>
                      )}
                    </TableRow>
                  )
                })
              )}
              {bidComparison && (
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">
                    Total:
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(bidComparison.totalEstimatedCost)}</TableCell>
                  {itemComparisons && (
                    <>
                      <TableCell
                        className={`text-right ${bidComparison.hasOverBudgetItems ? "text-red-600" : "text-green-600"}`}
                      >
                        {formatCurrency(bidComparison.lowestBidAmount)}
                      </TableCell>
                      <TableCell
                        className={`text-right ${bidComparison.hasOverBudgetItems ? "text-red-600" : "text-green-600"}`}
                      >
                        {bidComparison.marginPercentage.toFixed(2)}%
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subcontractors</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subcontractor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Invited</TableHead>
                <TableHead>Responded</TableHead>
                <TableHead className="text-right">Bid Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidRequest.subcontractors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No subcontractors invited.
                  </TableCell>
                </TableRow>
              ) : (
                bidRequest.subcontractors.map((sub) => {
                  const response = bidRequest.responses.find((r) => r.subcontractor.id === sub.subcontractor.id)

                  return (
                    <TableRow
                      key={sub.id}
                      className={bidRequest.awarded_to === sub.subcontractor.id ? "bg-green-50" : ""}
                    >
                      <TableCell className="font-medium">
                        <Link href={`/people/${sub.subcontractor.id}`} className="hover:underline">
                          {sub.subcontractor.business_name ||
                            `${sub.subcontractor.first_name} ${sub.subcontractor.last_name}`}
                        </Link>
                        {bidRequest.awarded_to === sub.subcontractor.id && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Awarded</Badge>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>{formatDate(sub.invited_at)}</TableCell>
                      <TableCell>{sub.responded_at ? formatDate(sub.responded_at) : "Not yet"}</TableCell>
                      <TableCell className="text-right">
                        {response ? formatCurrency(response.total_amount) : "-"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {bidRequest.responses.length > 0 && bidComparison && (
        <Card>
          <CardHeader>
            <CardTitle>Bid Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <BidComparisonChart bidRequest={bidRequest} bidComparison={bidComparison} />
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Estimated Cost</div>
                <div className="text-2xl font-bold">{formatCurrency(bidComparison.totalEstimatedCost)}</div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Lowest Bid</div>
                <div
                  className={`text-2xl font-bold ${bidComparison.hasOverBudgetItems ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(bidComparison.lowestBidAmount)}
                </div>
              </div>
              <div className="p-4 border rounded-md">
                <div className="text-sm text-muted-foreground">Margin Impact</div>
                <div
                  className={`text-2xl font-bold ${bidComparison.hasOverBudgetItems ? "text-red-600" : "text-green-600"}`}
                >
                  {formatCurrency(bidComparison.marginImpact)} ({bidComparison.marginPercentage.toFixed(2)}%)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
