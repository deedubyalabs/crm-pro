"use client"

import React, { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import ConversationInterface from "@/components/ai/conversational-estimator/ConversationInterface"
import type { Message, Attachment } from "@/components/ai/conversational-estimator/types"

import { EstimateForm } from "./estimate-form"
import { costItemService } from "@/lib/cost-items"
import { opportunityService } from "@/lib/opportunities"
import { personService } from "@/lib/people"
import type { EstimateLineItem, EstimatePaymentSchedule, EstimateWithDetails } from "@/types/estimates"
import { useRouter } from "next/navigation"
import { createEstimateAction, EstimateActionResult, updateEstimateAction } from "./actions"

interface UnifiedEstimateClientPageProps {
  estimate?: EstimateWithDetails; // Optional existing estimate data
}

export default function UnifiedEstimateClientPage({ estimate }: UnifiedEstimateClientPageProps) {
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>(
    estimate?.ai_conversation_history ? JSON.parse(estimate.ai_conversation_history) : [
    {
      id: uuidv4(),
      role: "assistant",
      content: estimate
        ? `Hello! We are currently looking at Estimate ${estimate.estimate_number || '(Draft)'} for ${estimate.person.name}. The current total is ${estimate.total_amount}. How can I help you update this estimate?`
        : "Hello! I'm HomePro AI. Describe the project you'd like to estimate, including scope, materials, and dimensions. I'll help you build an estimate.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  // State for line items and payment schedules, managed in parent
  const [lineItems, setLineItems] = useState<Partial<EstimateLineItem>[]>(estimate?.lineItems || []);
  const [paymentSchedules, setPaymentSchedules] = useState<Partial<EstimatePaymentSchedule>[]>(estimate?.paymentSchedules || []);

  // Get cost items for the line item selector
  const [costItems, setCostItems] = React.useState<Array<{
    id: string;
    item_code: string;
    name: string;
    description: string | null;
    type: string;
    unit: string;
    unit_cost: number;
    default_markup: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>>([])
  const [opportunityOptions, setOpportunityOptions] = React.useState<Array<{ id: string; name: string; person_id: string }>>([])
  const [peopleOptions, setPeopleOptions] = React.useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const loadData = async () => {
      const costItemsData = await costItemService.getCostItems({ isActive: true })
      setCostItems(costItemsData)

      const opportunities = await opportunityService.getOpportunities()
      const opportunityOptionsData = opportunities.map((opp) => ({
        id: opp.id,
        name: opp.opportunity_name,
        person_id: opp.person_id,
      }))
      setOpportunityOptions(opportunityOptionsData)

      const people = await personService.getPeople()
      const peopleOptionsData = people.map((person) => ({
        id: person.id,
        name: person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim(),
      }))
      setPeopleOptions(peopleOptionsData)
    }

    loadData()
  }, []) // Empty dependency array means this runs once on mount

  const handleSendMessage = async (text: string, attachments?: Attachment[]) => {
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      attachments,
    }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setIsProcessing(true)

    try {
      const messagesToSend = (messages.length === 1 && messages[0].role === 'assistant' && !estimate)
        ? [userMessage]
        : [...messages, userMessage];

      const response = await fetch("/api/ai/estimate-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "API request failed")
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: data.conversationalReply,
        timestamp: new Date().toISOString(),
      };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      console.log("AI Structured Data:", data.structuredEstimateData);

      if (data.structuredEstimateData?.lineItems && Array.isArray(data.structuredEstimateData.lineItems)) {
        const aiSuggestedLineItems: Partial<EstimateLineItem>[] = data.structuredEstimateData.lineItems.map((item: Partial<EstimateLineItem>) => ({
          ...item,
          isAISuggested: true,
        }));
        setLineItems((prevLineItems) => [...prevLineItems, ...aiSuggestedLineItems]);
      }

    } catch (error) {
      console.error("Error sending message to AI:", error);
      const errorMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date().toISOString(),
      }
      setMessages((prevMessages) => [...prevMessages, errorMessage])
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleFormSubmit(values: any, lineItems: Partial<EstimateLineItem>[], paymentSchedules: Partial<EstimatePaymentSchedule>[]) {
    setIsProcessing(true)
    try {
      let result: EstimateActionResult; // Use the unified action result type

      const estimateDataToSave = {
        ...values,
        lineItems: lineItems,
        paymentSchedules: paymentSchedules,
        ai_conversation_history: JSON.stringify(messages), // Save conversation history
      };

      if (estimate) {
        // Call update action if estimate exists
        result = await updateEstimateAction(estimate.id, estimateDataToSave);
      } else {
        // Call create action if no estimate exists
        result = await createEstimateAction(estimateDataToSave);
      }


      if (result.success) {
        router.push("/estimates") // Redirect to estimates list on success
      } else {
        console.error("Failed to save estimate:", result.error)
        // Display error to user
      }
    } catch (error) {
      console.error("Error submitting estimate form:", error)
      // Display error to user
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-8 text-sm">
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {estimate ? `Edit Estimate ${estimate.estimate_number || '(Draft)'}` : "AI-Assisted Estimate Creation"}
      </h2>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Pane: Conversation Interface */}
        <div className="lg:w-1/3 h-[600px] max-h-[70vh]">
          <ConversationInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isProcessing={isProcessing}
          />
        </div>

        {/* Right Pane: Estimate Form with Tabs */}
        <div className="lg:w-2/3">
           <EstimateForm
            estimate={estimate} // Pass existing estimate data to form
            costItems={costItems}
            opportunities={opportunityOptions}
            people={peopleOptions}
            onSubmit={handleFormSubmit}
            lineItems={lineItems}
            onLineItemsChange={setLineItems}
            paymentSchedules={paymentSchedules}
            onPaymentSchedulesChange={setPaymentSchedules}
            initialActiveTab="details"
          />
        </div>
      </div>
    </div>
  );
}
