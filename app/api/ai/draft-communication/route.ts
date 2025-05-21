import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { opportunityService } from '@/lib/opportunities';
import { estimateService } from '@/lib/estimates';

// Get the Agent Server URL from environment variables
const AGNO_AGENT_SERVER_URL = process.env.AGNO_AGENT_SERVER_URL;

export async function POST(request: Request) {
  if (!AGNO_AGENT_SERVER_URL) {
    console.error("AGNO_AGENT_SERVER_URL is not set. Please set it in your environment variables.");
    return NextResponse.json({ error: 'Agent Server URL is not configured on the server.' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const opportunityId: string | undefined = body.opportunityId;
    const communicationType: string | undefined = body.communicationType;

    if (!opportunityId || !communicationType) {
      return NextResponse.json({ error: 'opportunityId and communicationType are required in the request body.' }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Fetch opportunity details
    const opportunity = await opportunityService.getOpportunityById(opportunityId, supabase);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found.' }, { status: 404 });
    }

    let estimateDetails = null;
    // If communication type is related to estimate, fetch linked estimate
    if (communicationType === 'estimate_follow_up' && opportunity.estimates && opportunity.estimates.length > 0) {
        // Assuming the most recent estimate is relevant for follow-up
        const latestEstimate = opportunity.estimates.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
         if (latestEstimate) {
             estimateDetails = {
                 title: latestEstimate.title,
                 totalAmount: latestEstimate.total_amount,
                 issueDate: latestEstimate.issue_date,
                 status: latestEstimate.status,
                 // Add other relevant estimate details as needed
             };
         }
    }


    // Construct payload for Agno Agent Server
    const agentServerPayload = {
      opportunityId: opportunityId,
      communicationType: communicationType,
      context: {
        clientName: opportunity.person ? `${opportunity.person.first_name || ''} ${opportunity.person.last_name || ''}`.trim() || opportunity.person.business_name || 'client' : 'client',
        opportunityName: opportunity.opportunity_name,
        opportunityStatus: opportunity.status,
        estimateDetails: estimateDetails,
        // Add other relevant context from opportunity/person as needed
      },
    };

    // Make the HTTP POST request to the Agno Agent Server
    const agentServerResponse = await fetch(`${AGNO_AGENT_SERVER_URL}/api/v1/agents/communication/draft-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agentServerPayload),
    });

    if (!agentServerResponse.ok) {
      const errorBody = await agentServerResponse.text();
      console.error(`Error from Agent Server (draft-email): ${agentServerResponse.status} - ${errorBody}`);
      return NextResponse.json({ error: `Agent Server returned an error: ${agentServerResponse.status}`, details: errorBody }, { status: agentServerResponse.status });
    }

    // Parse the JSON response from the Agent Server
    const agentServerData: { draftedEmailText: string } = await agentServerResponse.json();

    return NextResponse.json(agentServerData, { status: 200 });

  } catch (error) {
    console.error('Error in /app/api/ai/draft-communication:', error);
    let errorMessage = 'An unknown error occurred while drafting communication.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to draft communication.', details: errorMessage }, { status: 500 });
  }
}
