"use client"

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { biddingService } from "@/lib/bidding-service";
import type { Subcontractor } from "@/types/subcontractor";
import { toast } from "@/components/ui/use-toast";
import { Mail } from "lucide-react";
import type { BidStatus } from "@/types/bidding"; // Import BidStatus

interface InviteSubcontractorsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  bidRequestId: string;
  onSubcontractorsInvited: () => void;
}

export default function InviteSubcontractorsDialog({ isOpen, onClose, bidRequestId, onSubcontractorsInvited }: InviteSubcontractorsDialogProps) {
  const [subcontractors, setSubcontractors] = useState<Subcontractor[]>([]);
  const [selectedSubcontractors, setSelectedSubcontractors] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchSubcontractors = async () => {
      setIsLoading(true);
      try {
        const fetchedSubcontractors = await biddingService.getSubcontractors();
        setSubcontractors(fetchedSubcontractors);
      } catch (error) {
        console.error("Failed to fetch subcontractors:", error);
        toast({
          title: "Error",
          description: "Failed to load subcontractors.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSubcontractors();
    }
  }, [isOpen]);

  const handleCheckboxChange = (subcontractorId: string) => {
    setSelectedSubcontractors((prev) => ({
      ...prev,
      [subcontractorId]: !prev[subcontractorId],
    }));
  };

  const handleInvite = async () => {
    const invitedSubcontractorIds = Object.keys(selectedSubcontractors).filter(
      (id) => selectedSubcontractors[id]
    );

    if (invitedSubcontractorIds.length === 0) {
      toast({
        title: "No Subcontractors Selected",
        description: "Please select at least one subcontractor to invite.",
        variant: "default", // Changed from "warning" to "default"
      });
      return;
    }

    setIsSending(true);
    try {
      // Here you would typically call an API to send invitations
      // For now, let's simulate an API call and create "Pending" bids for each invited subcontractor
      const createBidPromises = invitedSubcontractorIds.map(async (subId) => {
        const newBid = {
          bid_request_id: bidRequestId,
          subcontractor_id: subId,
          amount: 0, // Initial amount is 0, will be updated by subcontractor
          status: "Pending" as BidStatus, // Explicitly cast to BidStatus
        };
        return biddingService.createBid(newBid);
      });

      await Promise.all(createBidPromises);

      toast({
        title: "Invitations Sent",
        description: `Invitations sent to ${invitedSubcontractorIds.length} subcontractors.`,
      });
      onSubcontractorsInvited(); // Notify parent component to refresh bid requests
      onClose();
    } catch (error) {
      console.error("Failed to send invitations:", error);
      toast({
        title: "Error",
        description: "Failed to send invitations.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Subcontractors</DialogTitle>
          <DialogDescription>
            Select subcontractors to invite to bid on this request.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <p>Loading subcontractors...</p>
          ) : subcontractors.length === 0 ? (
            <p className="text-muted-foreground">No subcontractors found. Please add some first.</p>
          ) : (
            subcontractors.map((sub) => (
              <div key={sub.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`sub-${sub.id}`}
                  checked={selectedSubcontractors[sub.id] || false}
                  onCheckedChange={() => handleCheckboxChange(sub.id)}
                />
                <Label htmlFor={`sub-${sub.id}`}>
                  {sub.business_name || `${sub.first_name} ${sub.last_name}`} ({sub.email})
                </Label>
              </div>
            ))
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={isSending}>
            {isSending ? "Sending..." : <><Mail className="mr-2 h-4 w-4" /> Send Invitations</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
