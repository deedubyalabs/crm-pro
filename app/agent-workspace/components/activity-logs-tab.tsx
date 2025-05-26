"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface DebugLogEntry {
  timestamp: string;
  log: string;
}

export default function ActivityLogsTab() {
  const [debugLogs, setDebugLogs] = useState<DebugLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data for now. In a real scenario, this would fetch from an API.
    // The debugLog is returned by the /api/ai/assistant-chat endpoint.
    // For historical logs, a new API endpoint might be needed that fetches from Supabase.
    const mockLogs: DebugLogEntry[] = [
      { timestamp: new Date().toISOString(), log: "AI Action: Invoking LLM to determine next step." },
      { timestamp: new Date().toISOString(), log: "Tool Call: create_person with input {\"first_name\":\"John\",\"last_name\":\"Doe\",\"person_type\":\"Lead\"}" },
      { timestamp: new Date().toISOString(), log: "Tool Result: create_person returned Person created successfully with ID: 12345" },
      { timestamp: new Date().toISOString(), log: "AI Action: Responding to user." },
      { timestamp: new Date().toISOString(), log: "User message received: 'Create a new customer named Jane Smith.'" },
      { timestamp: new Date().toISOString(), log: "AI Action: Invoking LLM to determine next step." },
      { timestamp: new Date().toISOString(), log: "Tool Call: create_person with input {\"first_name\":\"Jane\",\"last_name\":\"Smith\",\"person_type\":\"Customer\"}" },
      { timestamp: new Date().toISOString(), log: "Tool Result: create_person returned Person created successfully with ID: 67890" },
    ];

    setDebugLogs(mockLogs);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-4">Loading agent activity logs...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Pro-pilot Debug Log</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] w-full rounded-md border p-4">
            {debugLogs.length === 0 ? (
              <p>No debug logs available.</p>
            ) : (
              debugLogs.map((entry, index) => (
                <div key={index} className="mb-2 text-sm">
                  <span className="font-mono text-gray-500">[{new Date(entry.timestamp).toLocaleTimeString()}]</span>{" "}
                  {entry.log}
                  {index < debugLogs.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
