import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { pathname } = new URL(request.url);

  if (pathname.endsWith('/lead-chat')) {
    const { message } = await request.json();
    // Mock response for lead chat
    return NextResponse.json({ reply: `AI for lead received: "${message}"` });
  } else if (pathname.endsWith('/qualify-lead-request')) {
    const { leadId } = await request.json();
    // Mock response for qualify lead request
    // In a real scenario, you would fetch lead details using leadId
    const mockLeadName = "This Lead"; // Placeholder
    return NextResponse.json({
      qualificationAssessment: `AI assessment pending for lead ${mockLeadName}.`,
      suggestedNextSteps: ["Follow up via email.", "Schedule a discovery call."],
    });
  } else {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
  }
}
