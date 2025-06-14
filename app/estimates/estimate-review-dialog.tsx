"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { EstimateWithDetails, EstimateLineItem, EstimatePaymentSchedule, EstimateSection } from "@/types/estimates"
import { formatCurrency } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface EstimateReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirmSubmit: () => void
  estimate: EstimateWithDetails | undefined
  sections: EstimateSection[] // Changed from lineItems to sections
  paymentSchedules: Partial<EstimatePaymentSchedule>[]
  totalAmount: number
}

export function EstimateReviewDialog({
  isOpen,
  onClose,
  onConfirmSubmit,
  estimate,
  sections, // Receive sections instead of lineItems
  paymentSchedules,
  totalAmount,
}: EstimateReviewDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Review and Submit Estimate</DialogTitle>
          <DialogDescription>
            Please review the estimate details before final submission.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Basic Estimate Details */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Estimate Overview</h3>
            <p><strong>Estimate Number:</strong> {estimate?.estimate_number || "N/A"}</p>
            <p><strong>Customer:</strong> {estimate?.person?.name || "N/A"}</p>
            <p><strong>Opportunity:</strong> {estimate?.opportunity?.opportunity_name || "N/A"}</p>
            <p><strong>Issue Date:</strong> {estimate?.issue_date ? new Date(estimate.issue_date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Expiration Date:</strong> {estimate?.expiration_date ? new Date(estimate.expiration_date).toLocaleDateString() : "N/A"}</p>
            <p><strong>Total Amount:</strong> {formatCurrency(totalAmount)}</p>
          </div>

          {/* Line Items Preview */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Line Items</h3>
            {sections.every(section => section.line_items.length === 0) ? ( // Check if all sections are empty
              <p className="text-muted-foreground">No line items to display.</p>
            ) : (
              <div className="space-y-4">
                {sections.map(section => (
                  <div key={section.id} className="mb-4">
                    <h4 className="font-semibold text-md mb-2">{section.name}</h4>
                    {section.line_items.length === 0 ? (
                      <p className="text-muted-foreground text-sm pl-4">No items in this section.</p>
                    ) : (
                      <div className="space-y-2 pl-4">
                        {section.line_items.map((item, index) => (
                          <div key={item.id || index} className="grid grid-cols-3 gap-2 text-sm">
                            <span className="col-span-2">{item.description}</span>
                            <span className="text-right">{formatCurrency(item.total || 0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Schedule Preview */}
          <div className="border rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Payment Schedule</h3>
            {paymentSchedules.length === 0 ? (
              <p className="text-muted-foreground">No payment schedule defined.</p>
            ) : (
              <div className="space-y-2">
                {paymentSchedules.map((schedule, index) => (
                  <div key={schedule.id || index} className="grid grid-cols-3 gap-2 text-sm">
                    <span className="col-span-2">{schedule.description}</span>
                    <span className="text-right">{formatCurrency(schedule.amount || 0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents Preview (Terms, Scope, Cover Sheet) */}
          <div className="border rounded-md p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-2">Documents</h3>
            <div>
              <h4 className="font-medium">Terms and Conditions:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{estimate?.terms_and_conditions || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium">Scope of Work:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{estimate?.scope_of_work || "N/A"}</p>
            </div>
            <div>
              <h4 className="font-medium">Cover Sheet Details:</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{estimate?.cover_sheet_details || "N/A"}</p>
            </div>
          </div>

          {/* AI Review Section (Placeholder) */}
          <div className="border rounded-md p-4 bg-blue-50/50">
            <h3 className="text-lg font-semibold mb-2 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 fill-blue-600" /> AI Review
            </h3>
            <p className="text-muted-foreground text-sm">
              AI will analyze the estimate for completeness, accuracy, and potential improvements here.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirmSubmit}>
            Confirm and Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
