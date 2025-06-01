"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { estimateService } from "@/lib/estimates"
import { useToast } from "@/hooks/use-toast"
import { Estimate } from "@/types/estimates"

interface EstimateStatusActionsProps {
  estimate: Estimate
}

export function EstimateStatusActions({ estimate }: EstimateStatusActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleMarkAsAccepted = async () => {
    setIsLoading(true)
    try {
      // For now, pass null for userId. In a real app, this would come from auth context.
      const result = await estimateService.handleEstimateAccepted(estimate.id, null)
      let description = "The estimate has been marked as Accepted."
      if (result.sovGenerated && result.sovId) {
        description += ` A Schedule of Values has been generated. View it <a href="/schedule-of-values/${result.sovId}" class="underline">here</a>.`
      }
      if (result.initialInvoiceGenerated && result.invoiceId) {
        description += ` An initial deposit invoice has been created. View it <a href="/invoices/${result.invoiceId}" class="underline">here</a>.`
      }
      toast({
        title: "Estimate Accepted!",
        description: description,
        variant: "default",
      })
      router.refresh() // Refresh the page to show updated status and links
    } catch (error: any) {
      toast({
        title: "Failed to Accept Estimate",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRejected = async () => {
    setIsLoading(true)
    try {
      await estimateService.updateEstimate(estimate.id, { status: "Rejected" })
      toast({
        title: "Estimate Rejected",
        description: "The estimate has been marked as Rejected.",
        variant: "default",
      })
      router.refresh() // Refresh the page to show updated status
    } catch (error: any) {
      toast({
        title: "Failed to Reject Estimate",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (estimate.status === "Sent") {
    return (
      <>
        <Button variant="outline" onClick={handleMarkAsRejected} disabled={isLoading}>
          <X className="mr-2 h-4 w-4" />
          {isLoading ? "Rejecting..." : "Mark as Rejected"}
        </Button>
        <Button onClick={handleMarkAsAccepted} disabled={isLoading}>
          <Check className="mr-2 h-4 w-4" />
          {isLoading ? "Accepting..." : "Mark as Accepted"}
        </Button>
      </>
    )
  }

  return null
}
