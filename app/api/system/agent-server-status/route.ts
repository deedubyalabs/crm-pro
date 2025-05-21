import { NextResponse } from 'next/server';

export async function GET() {
  const agentServerUrl = process.env.AGNO_AGENT_SERVER_URL || 'http://0.0.0.0:8000';
  const healthCheckUrl = `${agentServerUrl}/health`;

  try {
    const response = await fetch(healthCheckUrl);

    if (response.ok) {
      const details = await response.json();
      return NextResponse.json({ connected: true, details });
    } else {
      return NextResponse.json({ connected: false, error: `Agent server returned status: ${response.status}` }, { status: response.status });
    }
  } catch (error: any) {
    return NextResponse.json({ connected: false, error: `Failed to connect to agent server: ${error.message}` }, { status: 500 });
  }
}
