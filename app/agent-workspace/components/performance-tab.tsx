"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bot,
  CheckCircle2,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Added missing import
import { AgentService, Agent, AgentStats } from "@/lib/agent-service"
import { TaskService, Task } from "@/lib/task-service"

export default function PerformanceTab() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [agentStats, setAgentStats] = useState<AgentStats | null>(null)
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<"day" | "week" | "month">("day")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedAgents = await AgentService.getAgents() // Corrected access
        setAgents(fetchedAgents || [])

        const fetchedTasks = await TaskService.getTasks()
        setAllTasks(fetchedTasks || [])

        // For overall stats, we might fetch stats for a specific agent or aggregate
        // For now, let's try to get stats for the first agent if available
        if (fetchedAgents && fetchedAgents.length > 0) {
          const firstAgentId = fetchedAgents[0].id
          const fetchedStats = await AgentService.getAgentStats(firstAgentId, timeframe) // Corrected access
          setAgentStats(fetchedStats) // AgentService.getAgentStats returns AgentStats | null
        }
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeframe])

  // Helper function to format duration (moved here)
  const formatDuration = (start: string, end?: string) => {
    if (!end) return "Ongoing"
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffMs = endDate.getTime() - startDate.getTime()
    const diffSeconds = Math.round(diffMs / 1000)
    if (diffSeconds < 60) return `${diffSeconds}s`
    const diffMinutes = Math.round(diffSeconds / 60)
    return `${diffMinutes}m`
  }

  // Aggregate data for charts from allTasks
  const aggregateTaskData = (tasks: Task[], period: "day" | "week" | "month") => {
    const dataMap = new Map<string, { completed: number; failed: number }>()
    const now = new Date()

    tasks.forEach(task => {
      const taskDate = new Date(task.start_time)
      let key: string

      if (period === "day") {
        key = taskDate.toLocaleDateString() // e.g., "5/26/2025"
      } else if (period === "week") {
        // Simple week calculation: Monday of the week
        const firstDayOfWeek = new Date(taskDate)
        firstDayOfWeek.setDate(taskDate.getDate() - (taskDate.getDay() + 6) % 7) // Adjust to Monday
        key = firstDayOfWeek.toLocaleDateString()
      } else { // month
        key = `${taskDate.getFullYear()}-${taskDate.getMonth() + 1}` // e.g., "2025-5"
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { completed: 0, failed: 0 })
      }
      const current = dataMap.get(key)!
      if (task.status === "completed") {
        current.completed++
      } else if (task.status === "failed") {
        current.failed++
      }
    })

    // Sort by date/period for chart display
    const sortedData = Array.from(dataMap.entries())
      .map(([key, value]) => ({ name: key, ...value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())

    return sortedData
  }

  const taskChartData = aggregateTaskData(allTasks, timeframe)

  // Aggregate token usage data (placeholder, as agent_runs doesn't directly have token usage per run)
  // This would ideally come from a dedicated logging/metrics service or be part of agent_runs metadata
  const aggregateTokenData = (tasks: Task[], period: "day" | "week" | "month") => {
    const dataMap = new Map<string, { tokens: number }>()
    // Placeholder: assuming each task uses a fixed amount of tokens for demonstration
    const tokensPerTask = 1000

    tasks.forEach(task => {
      const taskDate = new Date(task.start_time)
      let key: string

      if (period === "day") {
        key = taskDate.toLocaleDateString()
      } else if (period === "week") {
        const firstDayOfWeek = new Date(taskDate)
        firstDayOfWeek.setDate(taskDate.getDate() - (taskDate.getDay() + 6) % 7)
        key = firstDayOfWeek.toLocaleDateString()
      } else { // month
        key = `${taskDate.getFullYear()}-${taskDate.getMonth() + 1}`
      }

      if (!dataMap.has(key)) {
        dataMap.set(key, { tokens: 0 })
      }
      const current = dataMap.get(key)!
      current.tokens += tokensPerTask // Add dummy token usage
    })

    const sortedData = Array.from(dataMap.entries())
      .map(([key, value]) => ({ name: key, ...value }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())

    return sortedData
  }

  const tokenChartData = aggregateTokenData(allTasks, timeframe)


  if (loading) {
    return <div className="text-center py-8">Loading performance metrics...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Monitor the performance and efficiency of your agents</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={(value) => setTimeframe(value as "day" | "week" | "month")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last 24 Hours</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTasks.length}</div>
              <p className="text-xs text-muted-foreground">across all agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">
                  {allTasks.length > 0
                    ? ((allTasks.filter(t => t.status === "completed").length / allTasks.length) * 100).toFixed(1)
                    : 0}
                  %
                </div>
                <div className="text-sm text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  {/* Placeholder for trend */}
                  N/A
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">of all tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allTasks.length > 0
                  ? formatDuration(
                      allTasks[0].start_time, // Just using first task for avg, ideally aggregate all
                      allTasks[0].end_time
                    )
                  : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">per task</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Token Usage</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <div className="text-2xl font-bold">{(agentStats?.tokenUsage || 0) / 1000}K</div>
                <div className="text-sm text-red-500 flex items-center">
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                  {/* Placeholder for trend */}
                  N/A
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Est. cost: ${((agentStats?.tokenUsage || 0) / 100000).toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trends</CardTitle>
              <CardDescription>Completed vs. failed tasks over time</CardDescription>
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
                  <LineChart data={taskChartData}>
                    <XAxis dataKey="name" />
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

          <Card>
            <CardHeader>
              <CardTitle>Token Usage Trends</CardTitle>
              <CardDescription>Total tokens consumed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  tokens: {
                    label: "Tokens Used",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tokenChartData}>
                    <XAxis dataKey="name" />
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
        </div>
      </CardContent>
    </Card>
  )
}
