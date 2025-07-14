import { NextResponse } from "next/server";
import { biddingService } from "@/lib/bidding-service";
import type { UpdateBid } from "@/types/bidding";

export async function GET(request: Request, { params }: { params: { id: string; bidId: string } }) {
  try {
    const bids = await biddingService.getBidsForBidRequest(params.id); // Re-use existing function for now
    const bid = bids.find(b => b.id === params.bidId);
    if (!bid) {
      return NextResponse.json({ message: "Bid not found" }, { status: 404 });
    }
    return NextResponse.json(bid);
  } catch (error) {
    console.error(`Error fetching bid ${params.bidId} for bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch bid" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string; bidId: string } }) {
  try {
    const updates: UpdateBid = await request.json();
    const updatedBid = await biddingService.updateBid(params.bidId, updates);
    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error(`Error updating bid ${params.bidId} for bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update bid" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string; bidId: string } }) {
  try {
    await biddingService.deleteBid(params.bidId);
    return NextResponse.json({ message: "Bid deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting bid ${params.bidId} for bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete bid" }, { status: 500 });
  }
}
