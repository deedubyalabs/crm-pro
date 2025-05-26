import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Message as VercelAIMessage } from 'ai';
import { v4 as uuidv4 } from 'uuid'; // Import uuidv4

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieStore = await cookies(); // Await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { data: { session: userSession } } = await supabase.auth.getSession();
    const userId = userSession?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user owns this conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', sessionId)
      .eq('user_id', userId)
      .single();

    if (conversationError || !conversation) {
      console.error("Error fetching conversation or user not authorized:", conversationError);
      return new Response(JSON.stringify({ error: 'Conversation not found or unauthorized.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('ai_messages')
      .select('content, sender_type, created_at')
      .eq('conversation_id', sessionId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error("Error fetching AI messages:", messagesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch messages.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Convert Supabase messages to Vercel AI SDK Message format
    const formattedMessages: VercelAIMessage[] = messages.map(msg => ({
      id: uuidv4(), // Generate a new ID for Vercel AI SDK
      role: msg.sender_type === 'user' ? 'user' : 'assistant',
      content: msg.content || '',
      createdAt: new Date(msg.created_at),
    }));

    return new Response(JSON.stringify(formattedMessages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in chat-history API:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch chat history." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
