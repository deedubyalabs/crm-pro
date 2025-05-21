import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const { agentName, taskId, status, summary, relatedEntityId, details } = await request.json();

  const supabase = createRouteHandlerClient({ cookies });

  try {
    const { data, error } = await supabase
      .from('ai_logs')
      .insert([
        {
          agent_name: agentName,
          task_id: taskId,
          status: status,
          summary: summary,
          related_entity_id: relatedEntityId,
          details: details,
        },
      ])
      .select();

    if (error) {
      console.error("Error logging agent activity:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Agent activity logged successfully", data }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error logging agent activity:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
