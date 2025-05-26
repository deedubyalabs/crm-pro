"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import {
  Bot,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import ActivityLogsTab from "./components/activity-logs-tab"
import ConfigurationTab from "./components/configuration-tab"
import PerformanceTab from "./components/performance-tab"
import ErrorLogsTab from "./components/error-logs-tab"
import { AgentService, Agent, AgentStats } from "@/lib/agent-service"

export default function AgentWorkspaceDashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedAgents = await AgentService.getAgents()
        setAgents(fetchedAgents || []) // AgentService.getAgents returns Agent[] or [] on error

        // For overall stats, we might need a dedicated endpoint or aggregate from individual agent stats
        // For now, let's fetch stats for a dummy agent or the first active agent if available
        if (fetchedAgents && fetchedAgents.length > 0) {
          const firstAgentId = fetchedAgents[0].id // Or a specific "Pro-pilot" agent ID
          const fetchedStats = await AgentService.getAgentStats(firstAgentId, "day")
          setAgentStats(fetchedStats) // AgentService.getAgentStats returns AgentStats | null
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const activeAgentsCount = agents.filter((agent) => agent.status === "active").length
  const totalAgentsCount = agents.length
  const activeAgentsProgress = totalAgentsCount > 0 ? (activeAgentsCount / totalAgentsCount) * 100 : 0

  // Placeholder for pending approvals and system health, as these might come from other services
  const pendingApprovals = 3 // This needs to be fetched from a real source
  const systemHealth = [
    { name: "HomePro API", status: "green" },
    { name: "OpenAI", status: "green" },
    { name: "Square", status: "green" },
    { name: "Google Calendar", status: "amber" },
  ]

  // Sample data for charts (will be replaced with real data later)
  const taskData = [
    { day: "Mon", completed: 12, failed: 2 },
    { day: "Tue", completed: 18, failed: 1 },
    { day: "Wed", completed: 15, failed: 3 },
    { day: "Thu", completed: 22, failed: 2 },
    { day: "Fri", completed: 20, failed: 0 },
    { day: "Sat", completed: 8, failed: 1 },
    { day: "Sun", completed: 5, failed: 0 },
  ]

  const tokenData = [
    { day: "Mon", tokens: 24500 },
    { day: "Tue", tokens: 32100 },
    { day: "Wed", tokens: 28700 },
    { day: "Thu", tokens: 41200 },
    { day: "Fri", tokens: 38500 },
    { day: "Sat", tokens: 15200 },
    { day: "Sun", tokens: 9800 },
  ]

  // Sample activity feed data (will be replaced with real data later)
  const activityFeed = [
    {
      id: 1,
      agent: "InvoiceProcessor",
      action: "Processed invoice #1042",
      time: "2 minutes ago",
      status: "success",
    },
    {
      id: 2,
      agent: "LeadQualifier",
      action: "Failed to process lead - Missing contact information",
      time: "15 minutes ago",
      status: "error",
    },
    {
      id: 3,
      agent: "AppointmentScheduler",
      action: "Created appointment for Johnson project",
      time: "32 minutes ago",
      status: "success",
    },
    {
      id: 4,
      agent: "ProjectManager",
      action: "Updated status for Smith project to 'In Progress'",
      time: "1 hour ago",
      status: "success",
    },
    {
      id: 5,
      agent: "CustomerSupport",
      action: "Waiting for approval - Send follow-up email to client",
      time: "1 hour ago",
      status: "warning",
    },
  ]

  if (loading) {
    return <div className="text-center py-8">Loading agent workspace data...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agent Workspace</h1>
        <p className="text-muted-foreground">Monitor and manage your intelligent agents</p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="performance-metrics">Performance</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="error-logs">Error Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {activeAgentsCount}/{totalAgentsCount}
                </div>
                <div className="pt-2">
                  <Progress value={activeAgentsProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Processed (24h)</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold">{agentStats?.tasksCompleted || 0}</div>
                  <div className="text-sm text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {/* Placeholder for percentage change */}
                    N/A
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">vs. previous 24h period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingApprovals}</div>
                <div className="flex items-center mt-1">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
                    Requires attention
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Usage (24h)</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold">{(agentStats?.tokenUsage || 0) / 1000}K</div>
                  <div className="text-sm text-red-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {/* Placeholder for percentage change */}
                    N/A
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Est. cost: ${((agentStats?.tokenUsage || 0) / 100000).toFixed(2)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts and Activity Feed */}
          <div className="grid gap-4 md:grid-cols-7">
            <Card className="md:col-span-4">
              <CardHeader>
                <CardTitle>Task Performance</CardTitle>
                <CardDescription>Completed vs. failed tasks over the past 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    completed: {
                      label: "Completed Tasks",
                      color: "hsl(var(--chart-1))",
                    },
                    failed: {
                      label: "Failed Tasks",
                      color: "hsl(var(--chart-2))",
                    },
                  }}
                  className="h-[300px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={taskData}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="var(--color-completed)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="failed"
                        stroke="var(--color-failed)"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent agent activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {activity.status === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      )}
                      {activity.status === "error" && <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />}
                      {activity.status === "warning" && (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.agent}</p>
                        <p className="text-sm text-muted-foreground">{activity.action}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/agent-workspace/logs">View all activity</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agent Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Status Overview</CardTitle>
              <CardDescription>Current status of all configured agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-4 rounded-md border p-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        agent.status === "active" ? "bg-green-100" : "bg-red-100"
                      }`}
                    >
                      <Bot
                        className={`h-4 w-4 ${agent.status === "active" ? "text-green-600" : "text-red-600"}`}
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{agent.name}</p>
                      <div className="flex items-center">
                        <Badge
                          className={`${
                            agent.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          {agent.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                        <span className="ml-2 text-xs text-muted-foreground">Last active: {agent.lastActivity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Status of connected systems and APIs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {systemHealth.map((system) => (
                  <div key={system.name} className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full bg-${system.status}-500`}></div>
                    <span className="text-sm">{system.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity-logs" className="space-y-4">
          <ActivityLogsTab />
        </TabsContent>

        <TabsContent value="performance-metrics" className="space-y-4">
          <PerformanceTab />
        </TabsContent>

        <TabsContent value="configuration" className="space-y-4">
          <ConfigurationTab />
        </TabsContent>

        <TabsContent value="error-logs" className="space-y-4">
          <ErrorLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}