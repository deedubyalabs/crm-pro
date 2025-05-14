"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RefreshCw } from "lucide-react"
import { biddingService } from "@/lib/bidding-service"

interface UpdateEstimateButtonProps {
  bidRequestId: string
  estimateId: string
  awardedSubcontractorId: string
}

export function UpdateEstimateButton({ bidRequestId, estimateId, awardedSubcontractorId }: UpdateEstimateButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [margin, setMargin] = useState(0)
  const [updateAll, setUpdateAll] = useState(true)

  const handleUpdate = async () => {
    setLoading(true)
    try {
      await biddingService.updateEstimateFromBid(estimateId, bidRequestId, awardedSubcontractorId, {
        applyMargin: margin,
        updateAll,
      })
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error updating estimate:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Estimate
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Estimate with Bid Prices</DialogTitle>
          <DialogDescription>
            This will update the estimate line items with the prices from the awarded bid.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="margin">Apply Margin (%)</Label>
            <Input
              id="margin"
              type="number"
              min="0"
              step="0.1"
              value={margin}
              onChange={(e) => setMargin(Number.parseFloat(e.target.value) || 0)}
            />
            <p className="text-sm text-muted-foreground">
              Add a percentage markup to the bid prices when updating the estimate.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="updateAll" checked={updateAll} onCheckedChange={(checked) => setUpdateAll(!!checked)} />
            <Label htmlFor="updateAll">Update all matching line items</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? "Updating..." : "Update Estimate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
