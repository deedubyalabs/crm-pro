import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
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

    const { data: conversations, error: fetchError } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false }); // Order by most recent activity

    if (fetchError) {
      console.error("Error fetching AI conversations:", fetchError);
      return new Response(JSON.stringify({ error: 'Failed to fetch conversations.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(conversations), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error in GET /api/ai/conversations:", error);
    return new Response(JSON.stringify({ error: "Failed to process request." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
