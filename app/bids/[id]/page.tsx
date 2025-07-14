"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Edit, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { biddingService } from "@/lib/bidding-service";
import type { BidRequest, Bid } from "@/types/bidding";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import InviteSubcontractorsDialog from "@/app/bids/components/invite-subcontractors-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { estimateLineItemService } from "@/lib/estimate-line-item-service"; // Import estimateLineItemService

interface BidRequestDetailPageProps {
  params: {
    id: string; // This is the bid_request_id
  };
}

export default function BidRequestDetailPage({ params }: BidRequestDetailPageProps) {
  const { id: bidRequestId } = params;
  const router = useRouter();
  const [bidRequest, setBidRequest] = useState<BidRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteSubcontractorsDialogOpen, setIsInviteSubcontractorsDialogOpen] = useState(false);
  const [isAwardConfirmOpen, setIsAwardConfirmOpen] = useState(false);
  const [selectedBidToAward, setSelectedBidToAward] = useState<Bid | null>(null);

  const fetchBidRequest = async () => {
    setIsLoading(true);
    try {
      const fetchedBidRequest = await biddingService.getBidRequestById(bidRequestId);
      if (fetchedBidRequest) {
        setBidRequest(fetchedBidRequest);
      } else {
        toast({
          title: "Error",
          description: "Bid request not found.",
          variant: "destructive",
        });
        router.push("/estimates"); // Redirect if bid request not found
      }
    } catch (error) {
      console.error("Failed to fetch bid request details:", error);
      toast({
        title: "Error",
        description: "Failed to load bid request details.",
        variant: "destructive",
      });
      router.push("/estimates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (bidRequestId) {
      fetchBidRequest();
    }
  }, [bidRequestId, router]);

  const getBidStatusBadge = (status: Bid["status"]) => {
    switch (status) {
      case "Submitted":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">Submitted</Badge>;
      case "Accepted":
        return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">Accepted</Badge>;
      case "Rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Rejected</Badge>;
      case "Pending":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">Pending</Badge>;
      case "Withdrawn":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">Withdrawn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAwardBid = async (bid: Bid) => {
    setSelectedBidToAward(bid);
    setIsAwardConfirmOpen(true);
  };

  const confirmAwardBid = async () => {
    if (!selectedBidToAward || !bidRequest) return;

    try {
      // 1. Update the awarded bid's status to "Accepted"
      const updatedBid = await biddingService.updateBid(selectedBidToAward.id, {
        status: "Accepted",
      });

      // 2. Decline all other bids for this bid request
      const declinePromises = bidRequest.subcontractor_bids
        ?.filter(b => b.id !== updatedBid.id && b.status === "Submitted")
        .map(b => biddingService.updateBid(b.id, { status: "Rejected" }));
      await Promise.all(declinePromises || []);

      // 3. Update the original estimate's line items and total amount
      // This part assumes estimateService.updateEstimateLineItemsFromAwardedBid exists
      // and handles prorating and updating the estimate based on bid_line_items.
      if (bidRequest.estimate_id && updatedBid.bid_line_items) {
        await estimateLineItemService.updateEstimateLineItemsFromAwardedBid(
          bidRequest.estimate_id,
          updatedBid.bid_line_items
        );
      }

      toast({
        title: "Bid Awarded",
        description: `Bid from ${selectedBidToAward.subcontractor?.business_name || selectedBidToAward.subcontractor?.first_name} has been awarded and estimate updated.`,
      });

      fetchBidRequest(); // Refresh data
    } catch (error) {
      console.error("Failed to award bid:", error);
      toast({
        title: "Error",
        description: "Failed to award bid and update estimate.",
        variant: "destructive",
      });
    } finally {
      setIsAwardConfirmOpen(false);
      setSelectedBidToAward(null);
    }
  };

  const handleDeclineBid = async (bid: Bid) => {
    if (!confirm("Are you sure you want to decline this bid?")) {
      return;
    }
    try {
      await biddingService.updateBid(bid.id, { status: "Rejected" });
      toast({
        title: "Bid Declined",
        description: "The bid has been successfully declined.",
      });
      fetchBidRequest(); // Refresh data
    } catch (error) {
      console.error("Failed to decline bid:", error);
      toast({
        title: "Error",
        description: "Failed to decline bid.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <p>Loading bid request details...</p>
      </div>
    );
  }

  if (!bidRequest) {
    return (
      <div className="container mx-auto py-6">
        <p>Bid request not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/estimates/${bidRequest.estimate_id}/edit`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to Estimate</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bidRequest.title}</h1>
            <p className="text-muted-foreground">For Estimate: {bidRequest.estimate_id}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {/* Add actions like Edit Bid Request, Send Invitations etc. */}
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" /> Edit Bid Request
          </Button>
          <Button onClick={() => setIsInviteSubcontractorsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Invite Subcontractors
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bid Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Status:</strong> {bidRequest.status}</p>
            <p><strong>Due Date:</strong> {bidRequest.due_date ? format(new Date(bidRequest.due_date), "PPP") : "N/A"}</p>
            <p><strong>Description:</strong> {bidRequest.description || "N/A"}</p>
            <p><strong>Created At:</strong> {format(new Date(bidRequest.created_at), "PPP p")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Included Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {bidRequest.line_items.length === 0 ? (
              <p className="text-muted-foreground">No line items included in this bid request.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead className="text-right">Est. Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bidRequest.line_items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subcontractor Bids</CardTitle>
        </CardHeader>
        <CardContent>
          {bidRequest.subcontractor_bids && bidRequest.subcontractor_bids.length === 0 ? (
            <p className="text-muted-foreground">No bids received yet for this request.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subcontractor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bidRequest.subcontractor_bids?.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      {bid.subcontractor?.business_name || `${bid.subcontractor?.first_name} ${bid.subcontractor?.last_name}` || "N/A"}
                    </TableCell>
                    <TableCell>{formatCurrency(bid.amount)}</TableCell>
                    <TableCell>{getBidStatusBadge(bid.status)}</TableCell>
                    <TableCell>{format(new Date(bid.submitted_at), "PPP p")}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {bid.status === "Submitted" && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleAwardBid(bid)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Award
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeclineBid(bid)}>
                            <XCircle className="mr-2 h-4 w-4" /> Decline
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/bids/${bidRequest.id}/bids/${bid.id}`}>View Details</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <InviteSubcontractorsDialog
        isOpen={isInviteSubcontractorsDialogOpen}
        onClose={() => setIsInviteSubcontractorsDialogOpen(false)}
        bidRequestId={bidRequestId}
        onSubcontractorsInvited={() => {
          // Refresh bid request details after invitations are sent
          const fetchBidRequest = async () => {
            setIsLoading(true);
            try {
              const fetchedBidRequest = await biddingService.getBidRequestById(bidRequestId);
              if (fetchedBidRequest) {
                setBidRequest(fetchedBidRequest);
              } else {
                toast({
                  title: "Error",
                  description: "Bid request not found.",
                  variant: "destructive",
                });
                router.push("/estimates");
              }
            } catch (error) {
              console.error("Failed to fetch bid request details:", error);
              toast({
                title: "Error",
                description: "Failed to load bid request details.",
                variant: "destructive",
              });
              router.push("/estimates");
            } finally {
              setIsLoading(false);
            }
          };
          fetchBidRequest();
        }}
      />

      <AlertDialog open={isAwardConfirmOpen} onOpenChange={setIsAwardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Award Bid Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to award this bid to {selectedBidToAward?.subcontractor?.business_name || selectedBidToAward?.subcontractor?.first_name} for a total of {formatCurrency(selectedBidToAward?.amount || 0)}.
              This will update the estimate's costs and mark other bids as rejected. Are you sure?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAwardBid}>Award Bid</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
