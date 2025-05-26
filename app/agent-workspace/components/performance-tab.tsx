"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bot, ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Sample data for charts
const taskData = [
  { day: "Mon", completed: 12, failed: 2 },
  { day: "Tue", completed: 18, failed: 1 },
  { day: "Wed", completed: 15, failed: 3 },
  { day: "Thu", completed: 22, failed: 2 },
  { day: "Fri", completed: 20, failed: 0 },
  { day: "Sat", completed: 8, failed: 1 },
  { day: "Sun", completed: 5, failed: 0 },
];

const tokenData = [
  { day: "Mon", tokens: 24500 },
  { day: "Tue", tokens: 32100 },
  { day: "Wed", tokens: 28700 },
  { day: "Thu", tokens: 41200 },
  { day: "Fri", tokens: 38500 },
  { day: "Sat", tokens: 15200 },
  { day: "Sun", tokens: 9800 },
];

export default function PerformanceTab() {
  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Token Usage</CardTitle>
          <CardDescription>Token consumption over the past 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              tokens: {
                label: "Token Usage",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tokenData}>
                <XAxis dataKey="day" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="var(--color-tokens)"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Performance</CardTitle>
          <CardDescription>Success rates and response times by agent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">InvoiceProcessor</span>
                </div>
                <span className="text-sm">98.2% success</span>
              </div>
              <Progress value={98.2} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg. response time: 1.2s</span>
                <span>112 tasks processed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">LeadQualifier</span>
                </div>
                <span className="text-sm">92.5% success</span>
              </div>
              <Progress value={92.5} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg. response time: 2.8s</span>
                <span>87 tasks processed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">AppointmentScheduler</span>
                </div>
                <span className="text-sm">95.7% success</span>
              </div>
              <Progress value={95.7} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg. response time: 1.5s</span>
                <span>46 tasks processed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">ProjectManager</span>
                </div>
                <span className="text-sm">97.1% success</span>
              </div>
              <Progress value={97.1} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg. response time: 2.1s</span>
                <span>68 tasks processed</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4" />
                  <span className="text-sm font-medium">CustomerSupport</span>
                </div>
                <span className="text-sm">89.3% success</span>
              </div>
              <Progress value={89.3} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Avg. response time: 3.4s</span>
                <span>75 tasks processed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
