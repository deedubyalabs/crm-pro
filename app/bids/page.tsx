import { BidRequestsList } from "./bids-list";
import { biddingService } from "@/lib/bidding-service"; // Import biddingService

export default async function BidsPage() { // Make the component async
  const bidRequests = await biddingService.getBidRequests(); // Fetch bid requests

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Bid Requests</h1>
      <BidRequestsList bidRequests={bidRequests} /> {/* Pass bidRequests as prop */}
    </div>
  );
}
