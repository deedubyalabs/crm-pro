import { LangChainAdapter, Message as VercelAIMessage } from 'ai';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { agentGraph } from "@/lib/agents/main-agent";
import { AgentState } from "@/lib/agents/agent-state";
import zepClient from "@/lib/zep";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { messages, data } = await request.json();
    const { entityType, entityId, sessionId: clientSessionId } = data || {};

    const cookieStore = await cookies();

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
    const userId = userSession?.user?.id || 'anonymous';

    const sessionId = clientSessionId || (entityId ? `chat-session-${entityId}` : `chat-session-${uuidv4()}`);

    // --- Supabase AI Conversation Management ---
    let conversationId: string;
    let conversationTitle: string = `Chat with AI (${new Date().toLocaleString()})`;

    const { data: existingConversation, error: fetchError } = await supabase
      .from('ai_conversations')
      .select('id, title')
      .eq('user_id', userId)
      .eq('id', sessionId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error("Error fetching existing AI conversation:", fetchError);
      throw new Error("Failed to fetch AI conversation.");
    }

    if (existingConversation) {
      conversationId = existingConversation.id;
      conversationTitle = existingConversation.title || conversationTitle;
      console.log(`Found existing AI conversation: ${conversationId}`);
    } else {
      const { data: newConversation, error: createError } = await supabase
        .from('ai_conversations')
        .insert({
          id: sessionId,
          user_id: userId,
          entity_type: entityType,
          entity_id: entityId,
          title: conversationTitle,
        })
        .select('id, title')
        .single();

      if (createError || !newConversation) {
        console.error("Error creating new AI conversation:", createError);
        throw new Error("Failed to create new AI conversation.");
      }
      conversationId = newConversation.id;
      conversationTitle = newConversation.title;
      console.log(`Created new AI conversation: ${conversationId}`);
    }

    // --- Zep Integration (existing logic) ---
    const user = userSession?.user;
    const zepUserId = user?.id || `anonymous-${uuidv4()}`;
    const firstName = user?.user_metadata?.first_name || 'Anonymous';
    const lastName = user?.user_metadata?.last_name || 'User';

    try {
      await zepClient.user.add({
        userId: zepUserId,
        firstName: firstName,
        lastName: lastName,
        email: user?.email || undefined,
      });
      console.log(`Zep User ${zepUserId} ensured.`);
    } catch (zepError) {
      console.error("Error ensuring Zep User:", zepError);
    }

    try {
      let zepSession = await zepClient.memory.getSession(sessionId);
      if (!zepSession) {
        await zepClient.memory.addSession({
          sessionId: sessionId,
          userId: zepUserId,
        });
        console.log(`Zep Session ${sessionId} created.`);
      } else {
        console.log(`Zep Session ${sessionId} already exists.`);
      }
    } catch (zepError) {
      console.error("Error ensuring Zep Session:", zepError);
    }

    let zepContext = "";
    try {
      const memory = await zepClient.memory.get(sessionId);
      if (memory?.context) {
        zepContext = memory.context;
        console.log("Retrieved Zep Context:", zepContext);
      }
    } catch (zepError) {
      console.error("Error retrieving Zep Context:", zepError);
    }

    // Convert Vercel AI SDK messages to LangChain messages
    const langChainMessages: BaseMessage[] = messages.map((msg: VercelAIMessage) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      throw new Error(`Unknown message role: ${msg.role}`);
    });

    const initialState: AgentState = {
      messages: langChainMessages,
      entityType,
      entityId,
      userId,
      sessionId,
      conversationHistory: JSON.stringify(messages),
      zepContext: zepContext,
    };

    console.log("Streaming agent graph with state:", initialState);

    const langGraphStream = await agentGraph.stream(initialState, {
      configurable: {
        thread_id: sessionId,
        checkpointer: new MemorySaver(),
      },
      recursionLimit: 50,
    });

    // --- Save User Message to Supabase ---
    const lastUserMessage = messages[messages.length - 1];
    if (lastUserMessage && lastUserMessage.role === 'user') {
      const { error: messageError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          sender_type: 'user',
          sender_id: userId,
          content: lastUserMessage.content,
          created_at: new Date(lastUserMessage.createdAt || Date.now()).toISOString(),
        });
      if (messageError) {
        console.error("Error saving user message to Supabase:", messageError);
      }
    }

    // --- Stream AI Response and Save to Supabase ---
    const responseStream = new ReadableStream({
      async start(controller) {
        let aiResponseContent = "";
        for await (const chunk of langGraphStream) {
          if (chunk.messages) {
            for (const msg of chunk.messages) {
              if (msg.content) {
                aiResponseContent += msg.content;
                controller.enqueue(msg.content);
              }
            }
          }
        }
        const { error: aiMessageError } = await supabase
          .from('ai_messages')
          .insert({
            conversation_id: conversationId,
            sender_type: 'ai',
            sender_id: null, // AI doesn't have a user ID in this context
            content: aiResponseContent,
            created_at: new Date().toISOString(),
          });
        if (aiMessageError) {
          console.error("Error saving AI message to Supabase:", aiMessageError);
        }
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: { 'Content-Type': 'text/plain' },
    });

  } catch (error) {
    console.error("Error in assistant-chat API:", error);
    return new Response(JSON.stringify({ error: "Failed to process AI request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
