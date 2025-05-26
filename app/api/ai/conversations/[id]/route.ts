import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id;

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
    const userId = userSession?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user owns this conversation before deleting
    const { data: conversation, error: conversationError } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (conversationError || !conversation) {
      console.error("Error fetching conversation or user not authorized for delete:", conversationError);
      return new Response(JSON.stringify({ error: 'Conversation not found or unauthorized.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { error: deleteError } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (deleteError) {
      console.error("Error deleting AI conversation:", deleteError);
      return new Response(JSON.stringify({ error: 'Failed to delete conversation.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ message: 'Conversation deleted successfully.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in DELETE /api/ai/conversations/[id]:", error);
    return new Response(JSON.stringify({ error: "Failed to process request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const conversationId = params.id;
    const { title } = await request.json();

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return new Response(JSON.stringify({ error: 'New title is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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
    const userId = userSession?.user?.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not authenticated.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify that the user owns this conversation before updating
    const { data: conversation, error: conversationError } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('id', conversationId)
      .eq('user_id', userId)
      .single();

    if (conversationError || !conversation) {
      console.error("Error fetching conversation or user not authorized for update:", conversationError);
      return new Response(JSON.stringify({ error: 'Conversation not found or unauthorized.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: updatedConversation, error: updateError } = await supabase
      .from('ai_conversations')
      .update({ title: title.trim(), updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .select('id, title')
      .single();

    if (updateError || !updatedConversation) {
      console.error("Error updating AI conversation:", updateError);
      return new Response(JSON.stringify({ error: 'Failed to update conversation.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(updatedConversation), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in PUT /api/ai/conversations/[id]:", error);
    return new Response(JSON.stringify({ error: "Failed to process request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
