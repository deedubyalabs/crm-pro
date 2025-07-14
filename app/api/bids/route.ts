import { NextResponse } from "next/server";
import { biddingService } from "@/lib/bidding-service";
import type { NewBidRequest, BidRequestFilters } from "@/types/bidding";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estimateId = searchParams.get("estimateId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;
    const status = searchParams.get("status") || undefined;
    const tradeCategory = searchParams.get("tradeCategory") || undefined;

    const filters: BidRequestFilters = {
      estimateId,
      projectId,
      status: status as BidRequestFilters["status"],
      tradeCategory,
    };

    const bidRequests = await biddingService.getBidRequests(filters);
    return NextResponse.json(bidRequests);
  } catch (error) {
    console.error("Error fetching bid requests:", error);
    return NextResponse.json({ message: "Failed to fetch bid requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newBidRequest: NewBidRequest = await request.json();
    const createdBidRequest = await biddingService.createBidRequest(newBidRequest);
    return NextResponse.json(createdBidRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating bid request:", error);
    return NextResponse.json({ message: "Failed to create bid request" }, { status: 500 });
  }
}
