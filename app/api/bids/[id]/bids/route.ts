import { NextResponse } from "next/server";
import { biddingService } from "@/lib/bidding-service";
import type { NewBid } from "@/types/bidding";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bids = await biddingService.getBidsForBidRequest(params.id);
    return NextResponse.json(bids);
  } catch (error) {
    console.error(`Error fetching bids for bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch bids" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const newBid: NewBid = await request.json();
    if (newBid.bid_request_id !== params.id) {
      return NextResponse.json({ message: "Bid request ID mismatch" }, { status: 400 });
    }
    const createdBid = await biddingService.createBid(newBid);
    return NextResponse.json(createdBid, { status: 201 });
  } catch (error) {
    console.error(`Error creating bid for bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to create bid" }, { status: 500 });
  }
}
