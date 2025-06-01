import { Suspense } from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Edit } from "lucide-react"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { changeOrderService, ChangeOrderWithDetails } from "@/lib/change-orders"
import { formatCurrency } from "@/lib/utils"
import { format } from "date-fns"

export const revalidate = 0

interface ChangeOrderDetailPageProps {
  params: {
    id: string
  }
}

export default async function ChangeOrderDetailPage({ params }: ChangeOrderDetailPageProps) {
  const changeOrder = await changeOrderService.getChangeOrderById(params.id)

  if (!changeOrder) {
    notFound()
  }

  return (
    <Suspense fallback={<ChangeOrderDetailSkeleton />}>
      <ChangeOrderDetail changeOrder={changeOrder} />
    </Suspense>
  )
}

interface ChangeOrderDetailProps {
  changeOrder: ChangeOrderWithDetails
}

function ChangeOrderDetail({ changeOrder }: ChangeOrderDetailProps) {
  return (
    <>
      <div className="flex items-start justify-between">
        <Heading
          title={`Change Order: ${changeOrder.change_order_number}`}
          description={changeOrder.title}
        />
        <Link href={`/change-orders/${changeOrder.id}/edit`}>
          <Button variant="outline" className="text-sm md:text-base">
            <Edit className="mr-2 h-4 w-4" /> Edit
          </Button>
        </Link>
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Project:</strong> {changeOrder.project?.project_name || "N/A"}</p>
            <p><strong>Customer:</strong> {changeOrder.person_id || "N/A"}</p>
            <p><strong>Status:</strong> {changeOrder.status}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(changeOrder.total_amount)}</p>
            <p><strong>Time Impact:</strong> {changeOrder.impact_on_timeline} days</p>
            {changeOrder.approval_date && (
              <p><strong>Approval Date:</strong> {format(new Date(changeOrder.approval_date), "PPP")}</p>
            )}
            {changeOrder.approved_by_person_id && (
              <p><strong>Approved By:</strong> {changeOrder.approved_by_person_id}</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description & Reason</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <h4 className="font-medium">Description:</h4>
              <p>{changeOrder.description}</p>
            </div>
            {changeOrder.reason && (
              <div>
                <h4 className="font-medium">Reason:</h4>
                <p>{changeOrder.reason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {changeOrder.line_items && changeOrder.line_items.length > 0 ? (
            <div className="space-y-4">
              {changeOrder.line_items.map((item, index) => (
                <div key={item.id || index} className="border p-4 rounded-md">
                  <p><strong>Description:</strong> {item.description}</p>
                  <p><strong>Quantity:</strong> {item.quantity} {item.unit}</p>
                  <p><strong>Unit Price:</strong> {formatCurrency(item.unit_price)}</p>
                  <p><strong>Total:</strong> {formatCurrency(item.total)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No line items for this change order.</p>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function ChangeOrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-96" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>
      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[200px] w-full md:col-span-2" />
      </div>

      <Skeleton className="h-[300px] w-full" />
    </div>
  )
}
