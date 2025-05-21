import { NextResponse } from 'next/server';
import type { Message } from '@/components/ai/conversational-estimator/types';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { personService } from '@/lib/people';
import { opportunityService } from '@/lib/opportunities';

// Define the expected response structure from the Agent Server
interface AgentServerResponse {
  conversationalReply: string;
  structuredEstimate: {
    projectType?: string;
    dimensions?: string; // Or more structured
    lineItems: Array<{
      aiSuggestionId: string;
      description: string;
      quantity: number;
      unit: string;
      unitCost?: number;
      markup?: number;
      total?: number;
      source?: string; // e.g., "Internal Library", "BigBox API", "AI Estimate"
      notesFromAI?: string;
      // Add other fields from your estimate_line_items table as needed
    }>;
    summary?: { [key: string]: number }; // e.g., subtotalMaterials, subtotalLabor, contingency, grandTotal
  };
  materialsToAddToLibrary: Array<{
    name: string;
    price: number;
    unit: string;
    sourceUrl?: string;
    // Add other fields needed to create a cost_item
  }>;
  sessionId: string; // Return the session ID used/generated
}

// Get the Agent Server URL from environment variables
const AGNO_AGENT_SERVER_URL = process.env.AGNO_AGENT_SERVER_URL;

export async function POST(request: Request) {
  if (!AGNO_AGENT_SERVER_URL) {
    console.error("AGNO_AGENT_SERVER_URL is not set. Please set it in your environment variables.");
    return NextResponse.json({ error: 'Agent Server URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const incomingMessages: Message[] = body.messages;
    const sessionId: string | undefined = body.sessionId; // Get session ID from request
    const personId: string | undefined = body.personId; // Get person ID from request
    const opportunityId: string | undefined = body.opportunityId; // Get opportunity ID from request
    let projectContext: any = body.projectContext; // Get project context (can be pre-filled or fetched)
    const contractorPreferences: any = body.contractorPreferences; // Get contractor preferences
    let customerZipCode: string | undefined = body.customerZipCode; // Get customer zip code (can be pre-filled or fetched)

    // If personId or opportunityId are provided, fetch context from Supabase
    if (personId || opportunityId) {
      const supabase = createRouteHandlerClient({ cookies });
      let person = null;
      let opportunity = null;

      if (opportunityId) {
        opportunity = await opportunityService.getOpportunityById(opportunityId);
        if (opportunity && opportunity.person_id) {
          person = await personService.getPersonById(opportunity.person_id);
        }
      } else if (personId) {
        person = await personService.getPersonById(personId);
      }

      // Construct projectContext and customerZipCode from fetched data if not already provided
      if (!projectContext) {
        projectContext = {
          clientName: person ? `${person.first_name || ''} ${person.last_name || ''}`.trim() || person.business_name || 'Unknown Client' : 'Unknown Client',
          opportunityName: opportunity ? opportunity.opportunity_name : 'New Opportunity',
          // Add other relevant context fields from person/opportunity as needed
        };
      }

      if (!customerZipCode && person && person.postal_code) {
        customerZipCode = person.postal_code;
      }
    }


    if (!incomingMessages || !Array.isArray(incomingMessages) || incomingMessages.length === 0) {
      // If no messages are provided but personId/opportunityId are,
      // assume this is the initial call to start the conversation.
      if (personId || opportunityId) {
         // Create an initial system message based on context
         let initialMessageContent = "Starting a new estimate.";
         if (projectContext?.clientName && projectContext?.opportunityName) {
            initialMessageContent = `Starting estimate for ${projectContext.clientName}'s ${projectContext.opportunityName} opportunity.`;
         } else if (projectContext?.clientName) {
            initialMessageContent = `Starting estimate for ${projectContext.clientName}.`;
         } else if (projectContext?.opportunityName) {
             initialMessageContent = `Starting estimate for the ${projectContext.opportunityName} opportunity.`;
         }
         incomingMessages.push({ role: 'system', content: initialMessageContent, id: Date.now().toString(), timestamp: new Date().toISOString() });

      } else {
         return NextResponse.json({ error: 'Messages are required in the request body for non-initial calls.' }, { status: 400 });
      }
    }


    // Construct the payload for the Agent Server
    const agentServerPayload = {
      conversationHistory: incomingMessages.map(msg => ({ role: msg.role, content: msg.content })),
      projectContext: projectContext,
      contractorPreferences: contractorPreferences,
      sessionId: sessionId,
      customerZipCode: customerZipCode,
      personId: personId, // Pass personId and opportunityId to the agent server
      opportunityId: opportunityId,
    };

    // Make the HTTP POST request to the Agno Agent Server
    const agentServerResponse = await fetch(`${AGNO_AGENT_SERVER_URL}/api/v1/estimate/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentServerPayload),
    });

    if (!agentServerResponse.ok) {
      const errorBody = await agentServerResponse.text();
      console.error(`Error from Agent Server: ${agentServerResponse.status} - ${errorBody}`);
      return NextResponse.json({ error: `Agent Server returned an error: ${agentServerResponse.status}`, details: errorBody }, { status: agentServerResponse.status });
    }

    // Parse the JSON response from the Agent Server
    const agentServerData: AgentServerResponse = await agentServerResponse.json();

    // The Agent Server's response structure matches what the frontend expects
    // (with structuredEstimate instead of structuredEstimateData)
    const responsePayload = {
      conversationalReply: agentServerData.conversationalReply,
      structuredEstimateData: agentServerData.structuredEstimate, // Map structuredEstimate to structuredEstimateData for frontend compatibility
      materialsToAddToLibrary: agentServerData.materialsToAddToLibrary, // Pass materials to add
      sessionId: agentServerData.sessionId, // Pass back the session ID
    };

    return NextResponse.json(responsePayload, { status: 200 });

  } catch (error) {
    console.error('Error in /app/api/ai/estimate-chat:', error);
    let errorMessage = 'An unknown error occurred while calling the Agent Server.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to communicate with the Agent Server.', details: errorMessage }, { status: 500 });
  }
}
