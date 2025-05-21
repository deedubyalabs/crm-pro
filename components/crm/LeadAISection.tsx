"use client";

import { useEffect } from 'react'; // Import useEffect
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useAIContext } from "@/contexts/ai-context"; // Import useAIContext

interface LeadAISectionProps {
  personId: string;
  personType: string;
}

export default function LeadAISection({ personId, personType }: LeadAISectionProps) {
  const { setContext } = useAIContext();

  useEffect(() => {
    // Set the AI context when the component mounts
    setContext(personType, personId);
    // Clean up context when component unmounts or personId/personType changes
    return () => setContext(null, null);
  }, [personId, personType, setContext]);

  return (
    <>
      {/* AI Insights & Suggestions Panel */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">AI Insights & Suggestions</h3>
        </CardHeader>
        <CardContent>
          {/* TODO: Populate with actual AI suggestions later */}
          <p className="text-sm text-muted-foreground">Proactive AI suggestions will appear here.</p>
        </CardContent>
      </Card>
    </>
  );
}
