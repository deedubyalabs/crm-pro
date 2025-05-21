"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import QualifyLeadButton from "./QualifyLeadButton";
import { MessageSquare } from "lucide-react"; // Import MessageSquare

interface LeadAISectionProps {
  personId: string;
  personType: string; // To conditionally render for leads
}

export default function LeadAISection({ personId, personType }: LeadAISectionProps) {
  const [qualificationAssessment, setQualificationAssessment] = useState<{ qualificationAssessment: string; suggestedNextSteps: string[] } | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ text: string; sender: 'user' | 'ai' }[]>([]);

  const handleQualify = (assessment: { qualificationAssessment: string; suggestedNextSteps: string[] }) => {
    setQualificationAssessment(assessment);
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;

    const newUserMessage = { text: chatInput, sender: 'user' as 'user' };
    setChatMessages([...chatMessages, newUserMessage]);
    setChatInput('');

    // Call mock chat API
    try {
      const response = await fetch('/api/ai/crm/lead-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: chatInput, leadId: personId }), // Include leadId
      });

      if (!response.ok) {
        throw new Error(`Error sending chat message: ${response.statusText}`);
      }

      const result = await response.json();
      const newAIMessage = { text: result.reply, sender: 'ai' as 'ai' };
      setChatMessages(prevMessages => [...prevMessages, newAIMessage]);

    } catch (error) {
      console.error("Error sending chat message:", error);
      // Optionally display an error message in the chat
      setChatMessages(prevMessages => [...prevMessages, { text: "Error sending message.", sender: 'ai' }]);
    }
  };

  if (personType !== 'lead') {
    return null; // Only render for leads
  }

  return (
    <>
      {/* AI Insights & Suggestions */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">AI Insights & Suggestions</h3>
        </CardHeader>
        <CardContent>
          {qualificationAssessment ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{qualificationAssessment.qualificationAssessment}</p>
              {qualificationAssessment.suggestedNextSteps.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Suggested Next Steps:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {qualificationAssessment.suggestedNextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Run AI qualification to see insights.</p>
          )}
        </CardContent>
      </Card>

      {/* AI Interactions */}
      <Card>
        <CardHeader className="pb-3">
          <h3 className="text-lg font-medium">AI Interactions</h3>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Qualify with AI Button */}
          <QualifyLeadButton leadId={personId} onQualified={handleQualify} />

          {/* Embedded Chat Interface */}
          <div className="border rounded-md p-4 h-80 flex flex-col">
            <div className="flex-grow overflow-y-auto space-y-2">
              {chatMessages.length > 0 ? (
                chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`rounded-lg p-2 text-sm max-w-[80%] ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                      {message.text}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">Chat with AI about this lead...</p>
              )}
            </div>
            <div className="flex items-center mt-4">
              <Input
                placeholder="Type your message here..."
                className="flex-grow mr-2"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendChatMessage();
                  }
                }}
              />
              <Button onClick={handleSendChatMessage}>Send</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
