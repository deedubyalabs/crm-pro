import { NextResponse } from "next/server";
import { biddingService } from "@/lib/bidding-service";
import type { UpdateBidRequest } from "@/types/bidding";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bidRequest = await biddingService.getBidRequestById(params.id);
    if (!bidRequest) {
      return NextResponse.json({ message: "Bid request not found" }, { status: 404 });
    }
    return NextResponse.json(bidRequest);
  } catch (error) {
    console.error(`Error fetching bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to fetch bid request" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates: UpdateBidRequest = await request.json();
    const updatedBidRequest = await biddingService.updateBidRequest(params.id, updates);
    return NextResponse.json(updatedBidRequest);
  } catch (error) {
    console.error(`Error updating bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to update bid request" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await biddingService.deleteBidRequest(params.id);
    return NextResponse.json({ message: "Bid request deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting bid request ${params.id}:`, error);
    return NextResponse.json({ message: "Failed to delete bid request" }, { status: 500 });
  }
}
