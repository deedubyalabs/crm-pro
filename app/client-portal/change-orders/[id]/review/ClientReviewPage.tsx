"use client"

import { useState } from "react"
import { ChangeOrderWithDetails } from "@/types/change-orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { changeOrderService } from "@/lib/change-orders"

interface ClientReviewPageProps {
  changeOrder: ChangeOrderWithDetails;
}

export function ClientReviewPage({ changeOrder }: ClientReviewPageProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await changeOrderService.updateChangeOrder(changeOrder.id, { status: "Approved" });
      toast({
        title: "Change Order Approved",
        description: "The change order has been successfully approved.",
      });
      // Optionally redirect or update UI
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message || "An error occurred during approval.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    try {
      await changeOrderService.updateChangeOrder(changeOrder.id, { status: "Rejected" });
      toast({
        title: "Change Order Rejected",
        description: "The change order has been successfully rejected.",
      });
      // Optionally redirect or update UI
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error.message || "An error occurred during rejection.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Order Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Change Order Number</p>
            <p className="font-medium">{changeOrder.change_order_number || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">{changeOrder.status}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Title</p>
            <p className="font-medium">{changeOrder.title}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="font-medium">{changeOrder.description || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Reason for Change</p>
            <p className="font-medium">{changeOrder.reason || "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Impact on Timeline</p>
            <p className="font-medium">{changeOrder.impact_on_timeline ? `${changeOrder.impact_on_timeline} days` : "N/A"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="font-medium">${changeOrder.total_amount.toFixed(2)}</p>
          </div>
          {changeOrder.status === "Approved" && changeOrder.approval_date && (
            <div>
              <p className="text-sm text-muted-foreground">Approval Date</p>
              <p className="font-medium">{format(new Date(changeOrder.approval_date), "PPP")}</p>
            </div>
          )}
          {changeOrder.status === "Approved" && changeOrder.approved_by_person_id && (
            <div>
              <p className="text-sm text-muted-foreground">Approved By</p>
              <p className="font-medium">{changeOrder.approved_by?.full_name || "N/A"}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          {changeOrder.line_items && changeOrder.line_items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {changeOrder.line_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity} {item.unit}</TableCell>
                    <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">No line items for this change order.</p>
          )}
        </CardContent>
      </Card>

      {changeOrder.status === "Pending Approval" && (
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-end space-x-4">
            <Button variant="destructive" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Approve
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
