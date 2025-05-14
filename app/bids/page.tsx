import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { BidRequestsList } from "./bids-list"
import { biddingService } from "@/lib/bidding-service"

export const dynamic = "force-dynamic"

export default async function BidsPage() {
  const bidRequests = await biddingService.getBidRequests()

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Bid Requests</h1>
        <Button asChild>
          <Link href="/bids/new">
            <Plus className="mr-2 h-4 w-4" />
            New Bid Request
          </Link>
        </Button>
      </div>

      <BidRequestsList bidRequests={bidRequests} />
    </div>
  )
}
