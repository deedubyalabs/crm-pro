"use client"

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import NewBidPackageDialog from "./new-bid-package-dialog";

interface BiddingSectionProps {
  estimateId: string;
}

export default function BiddingSection({ estimateId }: BiddingSectionProps) {
  const [isNewBidPackageDialogOpen, setIsNewBidPackageDialogOpen] = React.useState(false);

  const handleCreateNewBidPackage = (name: string) => {
    console.log("Creating new bid package:", name);
    // Here you would typically call an API to create the bid package
    setIsNewBidPackageDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Bidding Packages</CardTitle>
          <Button size="sm" onClick={() => setIsNewBidPackageDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Bid Package
          </Button>
        </CardHeader>
        <CardContent>
          <p>No bid packages created yet.</p>
          {/* Future: List of bid packages */}
        </CardContent>
      </Card>

      <NewBidPackageDialog
        isOpen={isNewBidPackageDialogOpen}
        onClose={() => setIsNewBidPackageDialogOpen(false)}
        onSubmit={handleCreateNewBidPackage}
      />
    </>
  );
}
