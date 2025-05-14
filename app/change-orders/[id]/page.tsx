import { notFound } from "next/navigation"
import Link from "next/link"
import { getChangeOrderById } from "@/lib/change-orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateBidButton } from "./create-bid-button"

export const dynamic = "force-dynamic"

interface ChangeOrderPageProps {
  params: {
    id: string
  }
}

export default async function ChangeOrderPage({ params }: ChangeOrderPageProps) {
  const changeOrder = await getChangeOrderById(params.id)

  if (!changeOrder) {
    notFound()
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Completed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Change Order: {changeOrder.co_number || "Draft"}</h1>
        <div className="flex space-x-4">
          <Button variant="outline" asChild>
            <Link href="/change-orders">Back to List</Link>
          </Button>
          <Button asChild>
            <Link href={`/change-orders/${params.id}/edit`}>Edit</Link>
          </Button>
          <CreateBidButton changeOrderId={params.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Change Order Details</CardTitle>
            <CardDescription>Basic information about this change order</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge className={getStatusBadgeColor(changeOrder.status)}>{changeOrder.status}</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Project</p>
              <p>{changeOrder.project?.project_name || "Unknown Project"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created</p>
              <p>{formatDate(changeOrder.created_at)}</p>
            </div>
            {changeOrder.status === "Approved" && (
              <>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved By</p>
                  <p>{changeOrder.approved_by_person_id || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approval Date</p>
                  <p>{formatDate(changeOrder.approved_at) || "Not specified"}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{changeOrder.description}</p>
            {changeOrder.reason && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">Reason for Change:</h3>
                <p className="whitespace-pre-wrap">{changeOrder.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Markup %</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changeOrder.line_items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No line items found.
                    </TableCell>
                  </TableRow>
                ) : (
                  changeOrder.line_items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{item.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unit_cost)}</TableCell>
                      <TableCell className="text-right">{item.markup}%</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">
                    Total Cost Impact:
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(changeOrder.cost_impact)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Project Impact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Cost Impact:</h3>
                <p className="text-2xl font-bold">{formatCurrency(changeOrder.cost_impact)}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Time Impact:</h3>
                <p className="text-2xl font-bold">{changeOrder.time_impact_days || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
