"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"
import { biddingService } from "@/lib/bidding-service" // Corrected import
import type { BidRequest } from "@/types/bidding" // Assuming a BidRequest type exists
import { format } from "date-fns"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

interface EstimateBiddingSectionProps {
  estimateId: string
}

export function EstimateBiddingSection({ estimateId }: EstimateBiddingSectionProps) {
  const [bidRequests, setBidRequests] = useState<BidRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBidRequests = async () => {
      setIsLoading(true)
      try {
        // Using the correctly imported biddingService
        const bids = await biddingService.getBidRequests({ estimateId: estimateId })
        setBidRequests(bids)
      } catch (error) {
        console.error("Failed to fetch bid requests:", error)
        toast({
          title: "Error",
          description: "Failed to load bid requests.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (estimateId) {
      fetchBidRequests()
    }
  }, [estimateId])

  const handleCreateBidRequest = () => {
    // Navigate to a new page or open a dialog/drawer for creating a bid request
    // For now, let's assume navigation to a dedicated bid creation page
    router.push(`/bids/new?estimateId=${estimateId}`)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bidding</CardTitle>
        <Button onClick={handleCreateBidRequest}>
          <Plus className="mr-2 h-4 w-4" /> Create Bid Request
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading bid requests...</div>
        ) : bidRequests.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No bid requests for this estimate yet.</p>
            <Button variant="link" onClick={handleCreateBidRequest}>Create your first bid request</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bidRequests.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.title}</TableCell>
                  <TableCell>{bid.trade_category || "N/A"}</TableCell>
                  <TableCell>{bid.status}</TableCell>
                  <TableCell>{bid.due_date ? format(new Date(bid.due_date), "PPP") : "N/A"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/bids/${bid.id}`)}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
