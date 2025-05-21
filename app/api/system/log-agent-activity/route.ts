import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface AgentActivityLog {
  agentName: string;
  taskId?: string;
  status: string; // e.g., "started", "completed", "failed", "tool_used"
  summary: string;
  relatedEntityId?: string; // e.g., estimate_id, opportunity_id, project_id
  details?: any; // Flexible JSONB for additional structured data
  // user_id will be inferred from the session if available, or can be passed if this is a system-to-system call
  user_id?: string;
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const logData = await request.json() as AgentActivityLog;

    // Validate required fields
    if (!logData.agentName || !logData.status || !logData.summary) {
      return NextResponse.json({ error: 'agentName, status, and summary are required fields.' }, { status: 400 });
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    let userIdToLog = logData.user_id;

    if (sessionData?.session?.user?.id) {
      userIdToLog = sessionData.session.user.id;
    }

    const { data, error } = await supabase
      .from('ai_logs')
      .insert([
        {
          agent_name: logData.agentName,
          task_id: logData.taskId,
          status: logData.status,
          summary: logData.summary,
          related_entity_id: logData.relatedEntityId,
          details: logData.details,
          user_id: userIdToLog, // Log the user if available
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting AI log:', error);
      return NextResponse.json({ error: 'Failed to log agent activity.', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Agent activity logged successfully.', logEntry: data }, { status: 201 });

  } catch (error) {
    console.error('Error processing agent activity log request:', error);
    let errorMessage = 'An unknown error occurred while logging agent activity.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Failed to process agent activity log.', details: errorMessage }, { status: 500 });
  }
}
