"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ConfigurationTab() {
  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Agent Configuration & Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This section will allow configuration of agent parameters, LLM models, tool enablement, and prompt templates.</p>
          <p className="text-sm text-muted-foreground mt-2">Future implementation.</p>
        </CardContent>
      </Card>
    </div>
  );
}
