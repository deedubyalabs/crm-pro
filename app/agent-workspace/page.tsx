import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Sample data for charts
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

// Sample activity feed data
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

export default function AgentWorkspaceDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Agent Workspace</h1>
        <p className="text-muted-foreground">Monitor and manage your intelligent agents</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5/6</div>
                <div className="pt-2">
                  <Progress value={83} className="h-2" />
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
                  <div className="text-2xl font-bold">87</div>
                  <div className="text-sm text-green-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    12%
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
                <div className="text-2xl font-bold">3</div>
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
                  <div className="text-2xl font-bold">190K</div>
                  <div className="text-sm text-red-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    8%
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Est. cost: $2.85</p>
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
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">InvoiceProcessor</p>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 2m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">LeadQualifier</p>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 15m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">AppointmentScheduler</p>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 32m ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">ProjectManager</p>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 1h ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Bot className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">CustomerSupport</p>
                    <div className="flex items-center">
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 1h ago</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                    <Bot className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">EstimateGenerator</p>
                    <div className="flex items-center">
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
                      <span className="ml-2 text-xs text-muted-foreground">Last active: 2d ago</span>
                    </div>
                  </div>
                </div>
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
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">HomePro API</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">OpenAI</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">Square</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm">Google Calendar</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Summary</CardTitle>
              <CardDescription>Recent and frequent errors across all agents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">LeadQualifier - Missing Contact Information</h3>
                      <div className="mt-1 text-sm text-red-700">
                        <p>Failed to process lead due to missing required contact information (email or phone).</p>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-red-700">Occurred 5 times today</span>
                          <span className="text-red-700">Last occurrence: 15 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">CustomerSupport - API Rate Limit</h3>
                      <div className="mt-1 text-sm text-red-700">
                        <p>Encountered API rate limit when attempting to fetch customer history.</p>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-red-700">Occurred 2 times today</span>
                          <span className="text-red-700">Last occurrence: 2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-md bg-amber-50 p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-amber-800">AppointmentScheduler - Calendar Sync Delay</h3>
                      <div className="mt-1 text-sm text-amber-700">
                        <p>Google Calendar synchronization delayed by more than 5 minutes.</p>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-amber-700">Occurred 1 time today</span>
                          <span className="text-amber-700">Last occurrence: 45 minutes ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
