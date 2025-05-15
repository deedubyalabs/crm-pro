import { NextRequest, NextResponse } from 'next/server';
import { opportunityService } from '@/lib/opportunities';
import { estimateService } from '@/lib/estimates';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Correct Gemini import
import { formatDate, formatCurrency } from '@/lib/utils'; // Import utility functions
import type { Estimate } from '@/types/estimates'; // Import Estimate type

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set. Please set it in your environment variables.");
  // In a real application, you might want to return an error response here
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || ""); // Initialize Gemini client

const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" }); // Use gemini-2.0-flash-lite for text generation

export async function POST(req: NextRequest) {
  try {
    const { opportunityId, communicationType } = await req.json();

    if (!opportunityId || !communicationType) {
      return NextResponse.json({ error: 'Missing opportunityId or communicationType' }, { status: 400 });
    }

    // Fetch opportunity details
    const opportunity = await opportunityService.getOpportunityById(opportunityId);

    if (!opportunity) {
      return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
    }

    let prompt = "";

    if (communicationType === "estimate_follow_up") {
      // Fetch linked estimates for estimate follow-up
      // Fetch linked estimates for estimate follow-up using getEstimates with opportunityId filter
      const estimates = await estimateService.getEstimates({ opportunityId: opportunityId });
      const acceptedEstimate = estimates.find((est: Estimate) => est.status === 'Accepted'); // Find an accepted estimate if available

      let estimateDetails = "No linked estimate found.";
      if (acceptedEstimate) {
        estimateDetails = `An estimate totaling ${formatCurrency(acceptedEstimate.total_amount)} was sent on ${formatDate(acceptedEstimate.created_at)}.`;
      } else if (estimates.length > 0) {
         // If no accepted estimate, mention the most recent one sent
         const mostRecentEstimate = estimates.sort((a: Estimate, b: Estimate) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
         estimateDetails = `An estimate totaling ${formatCurrency(mostRecentEstimate.total_amount)} was sent on ${formatDate(mostRecentEstimate.created_at)}.`;
      }


      prompt = `You are a helpful assistant for a solo residential contractor. Draft a polite, concise, and professional follow-up email to a potential client, ${opportunity.person?.name || 'the client'}, regarding an opportunity titled '${opportunity.opportunity_name}'. ${estimateDetails} The current status of the opportunity is '${opportunity.status}'. The goal of the email is to gently remind them, see if they have any questions, and encourage them to discuss next steps. Keep it brief and friendly.`;

    } else if (communicationType === "initial_outreach_reminder") {
        prompt = `You are a helpful assistant for a solo residential contractor. Draft a polite, concise, and professional reminder email to a potential client, ${opportunity.person?.name || 'the client'}, regarding an opportunity titled '${opportunity.opportunity_name}'. The current status of the opportunity is '${opportunity.status}'. The goal of the email is to gently remind them about the initial outreach and see if they are still interested or have any questions. Keep it brief and friendly.`;
    }
    // Add other communication types here

    if (!prompt) {
        return NextResponse.json({ error: 'Unsupported communication type' }, { status: 400 });
    }

    // Call Gemini API
    const result = await model.generateContent(prompt); // Use the initialized model
    const response = result.response;
    const draftedEmailText = response.text(); // Extract text from Gemini response

    return NextResponse.json({ draftedEmailText });

  } catch (error) {
    console.error('Error drafting communication:', error);
    return NextResponse.json({ error: 'Failed to draft communication' }, { status: 500 });
  }
}
