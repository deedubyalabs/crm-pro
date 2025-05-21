import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

export async function POST(request: Request) {
  const { message, entityType, entityId, conversationHistory } = await request.json();

  const session = await getServerSession({ cookies });
  const userId = session?.user?.id || 'anonymous'; // Get user ID from session, default to 'anonymous'

  // Generate a session ID for the chat if not already present in conversationHistory or request
  // For simplicity, let's assume the frontend will manage a persistent sessionId for the chat drawer.
  // If not, a new one could be generated here or passed from the frontend.
  // For now, we'll use a simple placeholder or derive from entityId if available.
  const sessionId = entityId ? `chat-session-${entityId}` : `chat-session-${crypto.randomUUID()}`;

  try {
    const pythonPayload = {
      message,
      entityType,
      entityId,
      userId,
      sessionId,
      conversationHistory,
    };

    let pythonFunctionUrl = '/api/python/echo_agent'; // Default to echo agent

    if (entityType === 'person' || entityType === 'lead') {
      pythonFunctionUrl = '/api/python/lia_lead_assistant';
    }

    console.log(`Sending payload to Python Serverless Function (${pythonFunctionUrl}):`, pythonPayload);

    const pythonResponse = await fetch(pythonFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pythonPayload),
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error(`Error from Python Serverless Function: ${pythonResponse.status} - ${errorText}`);
      return NextResponse.json({ error: `AI server error: ${pythonResponse.statusText}` }, { status: pythonResponse.status });
    }

    const pythonData = await pythonResponse.json();
    console.log("Received response from Python Serverless Function:", pythonData);

    // Python Serverless Function is expected to return { "aiResponse": "...", "newConversationHistory": [...] }
    return NextResponse.json({
      aiResponse: pythonData.aiResponse,
      newConversationHistory: pythonData.newConversationHistory,
    });

  } catch (error) {
    console.error("Error connecting to Python Serverless Function:", error);
    return NextResponse.json({ error: "Failed to connect to AI server." }, { status: 500 });
  }
}
async function getServerSession(arg0: { cookies: () => Promise<ReadonlyRequestCookies>; }) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
