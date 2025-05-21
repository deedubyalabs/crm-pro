"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface QualifyLeadButtonProps {
  leadId: string;
  onQualified: (assessment: { qualificationAssessment: string; suggestedNextSteps: string[] }) => void; // Callback prop
  asMenuItem?: boolean; // New prop to render as a menu item
}

export default function QualifyLeadButton({ leadId, onQualified, asMenuItem }: QualifyLeadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleQualifyClick = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/crm/qualify-lead-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId }),
      });

      if (!response.ok) {
        throw new Error(`Error qualifying lead: ${response.statusText}`);
      }

      const result = await response.json();
      onQualified(result); // Call the callback with the result
      toast({
        title: "AI Qualification Assessment Received",
        description: "Assessment details are now available in the AI Insights panel.",
      });

    } catch (error) {
      console.error("Error qualifying lead:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during AI qualification.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (asMenuItem) {
    return (
      <div onClick={handleQualifyClick} className="flex items-center cursor-pointer" role="menuitem" aria-disabled={isLoading}>
        <MessageSquare className="mr-2 h-4 w-4" />
        {isLoading ? "Qualifying..." : "Qualify with AI"}
      </div>
    );
  }

  return (
    <Button className="w-full justify-start" variant="outline" onClick={handleQualifyClick} disabled={isLoading}>
      <MessageSquare className="mr-2 h-4 w-4" />
      {isLoading ? "Qualifying..." : "Qualify with AI"}
    </Button>
  );
}
