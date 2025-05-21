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
import { useRouter, useSearchParams } from "next/navigation" // Import useSearchParams
import { createEstimateAction, EstimateActionResult, updateEstimateAction } from "./actions"
import { Button } from "@/components/ui/button"; // Import Button component

interface UnifiedEstimateClientPageProps {
  estimate?: EstimateWithDetails; // Optional existing estimate data
}

export default function UnifiedEstimateClientPage({ estimate }: UnifiedEstimateClientPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get search params

  const personIdFromUrl = searchParams.get('personId');
  const opportunityIdFromUrl = searchParams.get('opportunityId');

  const [initialEstimateData, setInitialEstimateData] = useState<EstimateWithDetails | undefined>(estimate);

  const [messages, setMessages] = useState<Message[]>([]); // Initialize as empty, will set in useEffect
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  // State for line items and payment schedules, managed in parent
  const [lineItems, setLineItems] = useState<Partial<EstimateLineItem>[]>(estimate?.lineItems || []);
  const [paymentSchedules, setPaymentSchedules] = useState<Partial<EstimatePaymentSchedule>[]>(estimate?.paymentSchedules || []);

  const [showCreateProjectButton, setShowCreateProjectButton] = useState(false); // State to control button visibility
  // const [showFloorPlanModal, setShowFloorPlanModal] = useState(false); // State to control Floor Plan modal visibility

  useEffect(() => {
    if (estimate && estimate.status === 'Accepted') {
      setShowCreateProjectButton(true);
    } else {
      setShowCreateProjectButton(false);
    }
  }, [estimate]); // Update button visibility when estimate changes

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

      // Handle pre-filling from URL parameters
      let prefilledPersonId = personIdFromUrl;
      let prefilledOpportunityId = opportunityIdFromUrl;
      let initialGreeting = "Hello! I'm HomePro AI. Describe the project you'd like to estimate, including scope, materials, and dimensions. I'll help you build an estimate.";
      let prefilledEstimate: Partial<EstimateWithDetails> = {};

      if (opportunityIdFromUrl) {
        const opportunity = await opportunityService.getOpportunityById(opportunityIdFromUrl);
        if (opportunity) {
          prefilledOpportunityId = opportunity.id;
          prefilledPersonId = opportunity.person_id; // Ensure personId is also set from opportunity
          initialGreeting = `Hello! I'm HomePro AI. Let's create an estimate for ${opportunity.person.name}'s opportunity: '${opportunity.opportunity_name}'. Can you describe the scope?`;
          prefilledEstimate = {
            opportunity_id: opportunity.id,
            person_id: opportunity.person_id,
            opportunity: { id: opportunity.id, opportunity_name: opportunity.opportunity_name }, // Provide necessary opportunity properties
            person: {
              id: opportunity.person.id,
              first_name: opportunity.person.first_name,
              last_name: opportunity.person.last_name,
              business_name: opportunity.person.business_name,
              email: opportunity.person.email,
              phone: opportunity.person.phone,
              name: opportunity.person.business_name || `${opportunity.person.first_name || ""} ${opportunity.person.last_name || ""}`.trim(), // Derived name
            },
          };
        }
      } else if (personIdFromUrl) {
        const person = await personService.getPersonById(personIdFromUrl);
        if (person) {
          initialGreeting = `Hello! I'm HomePro AI. I see we're starting an estimate for ${person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim()}. What project are they looking to do?`;
          prefilledEstimate = {
            person_id: person.id,
            person: {
              id: person.id,
              first_name: person.first_name,
              last_name: person.last_name,
              business_name: person.business_name,
              email: person.email,
              phone: person.phone,
              name: person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim(), // Derived name
            },
          };
        }
      }

      // Set initial messages
      setMessages(
        estimate?.ai_conversation_history ? JSON.parse(estimate.ai_conversation_history) : [
          {
            id: uuidv4(),
            role: "assistant",
            content: estimate
              ? `Hello! We are currently looking at Estimate ${estimate.estimate_number || '(Draft)'} for ${estimate.person.name}. The current total is ${estimate.total_amount}. How can I help you update this estimate?`
              : initialGreeting, // Use contextual greeting for new estimates
            timestamp: new Date().toISOString(),
          },
        ]
      );

      // Update initial estimate data state for the form
      if (!estimate && (prefilledPersonId || prefilledOpportunityId)) {
         setInitialEstimateData({
           ...prefilledEstimate,
           lineItems: [],
           paymentSchedules: [],
           ai_conversation_history: null, // No history for new estimates
           id: '', // Placeholder, will be generated on save
           created_at: '',
           updated_at: '',
           status: 'Draft',
           total_amount: 0,
           // person and opportunity are now provided in prefilledEstimate
         } as any); // Cast to any to bypass type error for now
      }
    }

    loadData()
  }, [estimate, personIdFromUrl, opportunityIdFromUrl]); // Add dependencies for URL params and estimate

  // Effect to initiate AI conversation on load if personId or opportunityId are present
  useEffect(() => {
    const initiateAIConversation = async () => {
      // Only run if it's a new estimate and IDs are present
      if (!estimate && (personIdFromUrl || opportunityIdFromUrl)) {
        setIsProcessing(true);

        try {
          // Construct initial payload with IDs and an initial system message
          const initialMessages: Message[] = [{
            id: uuidv4(),
            role: 'system',
            content: 'Initiate AI estimate based on provided context.', // This will be replaced by backend's contextual message
            timestamp: new Date().toISOString(),
          }];

          const response = await fetch("/api/ai/estimate-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              messages: initialMessages,
              personId: personIdFromUrl,
              opportunityId: opportunityIdFromUrl,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "API request failed during initiation");
          }

          const data = await response.json();

          // Set the initial assistant message from the backend's response
          const assistantMessage: Message = {
            id: uuidv4(),
            role: "assistant",
            content: data.conversationalReply,
            timestamp: new Date().toISOString(),
          };
          setMessages([assistantMessage]); // Replace initial system message with actual assistant reply

          console.log("AI Structured Data (Initial):", data.structuredEstimateData);
          console.log("AI Suggested Materials to Add (Initial):", data.materialsToAddToLibrary);

          if (data.structuredEstimateData?.lineItems && Array.isArray(data.structuredEstimateData.lineItems)) {
            const aiSuggestedLineItems: Partial<EstimateLineItem>[] = data.structuredEstimateData.lineItems.map((item: Partial<EstimateLineItem>) => ({
              ...item,
              isAISuggested: true,
            }));
            setLineItems(aiSuggestedLineItems); // Set initial line items
          }

        } catch (error) {
          console.error("Error initiating AI conversation:", error);
          const errorMessage: Message = {
            id: uuidv4(),
            role: "assistant",
            content: `Sorry, I encountered an error while starting the AI conversation: ${error instanceof Error ? error.message : String(error)}`,
            timestamp: new Date().toISOString(),
          };
          setMessages([errorMessage]); // Display error message
        } finally {
          setIsProcessing(false);
        }
      }
    };

    initiateAIConversation();
  }, [estimate, personIdFromUrl, opportunityIdFromUrl]); // Dependencies: run when estimate or IDs change


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
      // For subsequent messages, send the full conversation history
      const messagesToSend = [...messages, userMessage];

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
      console.log("AI Suggested Materials to Add:", data.materialsToAddToLibrary); // Log materials to add

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

  const handleCreateProject = () => {
    if (estimate?.id) {
      router.push(`/projects/new?estimateId=${estimate.id}`);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8 text-sm">
      <div className="flex justify-between items-center mb-4"> {/* Flex container for heading and button */}
        <h2 className="text-2xl font-semibold tracking-tight">
          {estimate ? `Edit Estimate ${estimate.estimate_number || '(Draft)'}` : "AI-Assisted Estimate Creation"}
        </h2>
        {showCreateProjectButton && (
          <Button onClick={handleCreateProject}>
            Create Project from this Estimate
          </Button>
        )}
      </div>
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
            estimate={initialEstimateData} // Pass initialEstimateData to form
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
