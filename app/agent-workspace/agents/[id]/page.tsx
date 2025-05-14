import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Copy, Key, Shield } from "lucide-react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// Sample agent data - in a real app, this would come from the API
const agent = {
  id: "agent-1",
  name: "InvoiceProcessor",
  description: "Processes and validates invoices, updates payment status",
  status: "active",
  model: "gpt-4o",
  systemPrompt:
    "You are an invoice processing assistant. Your job is to extract information from invoices, validate them against our records, and update payment status. Always be precise and thorough in your analysis.",
  lastActivity: "2 minutes ago",
  tasksProcessed: 112,
  errorRate: 1.8,
  createdAt: "2023-01-15T10:30:00Z",
  updatedAt: "2023-05-02T14:20:00Z",
}

// Sample activity data
const activityData = [
  {
    id: "task-1",
    type: "Invoice Processing",
    status: "completed",
    timestamp: "2023-05-03T14:45:00Z",
    details: "Processed invoice #1042 for Johnson Residence",
  },
  {
    id: "task-2",
    type: "Invoice Processing",
    status: "completed",
    timestamp: "2023-05-03T14:30:00Z",
    details: "Processed invoice #1041 for Smith Project",
  },
  {
    id: "task-3",
    type: "Payment Update",
    status: "completed",
    timestamp: "2023-05-03T14:15:00Z",
    details: "Updated payment status for invoice #1039",
  },
  {
    id: "task-4",
    type: "Invoice Processing",
    status: "failed",
    timestamp: "2023-05-03T14:00:00Z",
    details: "Failed to process invoice #1040 - Missing line items",
  },
  {
    id: "task-5",
    type: "Invoice Processing",
    status: "completed",
    timestamp: "2023-05-03T13:45:00Z",
    details: "Processed invoice #1038 for Thompson Renovation",
  },
]

// Sample performance data for charts
const performanceData = [
  { day: "Mon", tasks: 18, errors: 0 },
  { day: "Tue", tasks: 22, errors: 1 },
  { day: "Wed", tasks: 15, errors: 0 },
  { day: "Thu", tasks: 25, errors: 0 },
  { day: "Fri", tasks: 32, errors: 1 },
  { day: "Sat", tasks: 0, errors: 0 },
  { day: "Sun", tasks: 0, errors: 0 },
]

// Sample tools data
const tools = [
  {
    id: "tool-1",
    name: "createInvoice",
    description: "Create a new invoice",
    endpoint: "POST /api/v1/invoices",
    status: "enabled",
  },
  {
    id: "tool-2",
    name: "getInvoiceDetails",
    description: "Get invoice details",
    endpoint: "GET /api/v1/invoices/{invoiceId}",
    status: "enabled",
  },
  {
    id: "tool-3",
    name: "updateInvoiceStatus",
    description: "Update invoice status",
    endpoint: "PATCH /api/v1/invoices/{invoiceId}/status",
    status: "enabled",
  },
  {
    id: "tool-4",
    name: "getCustomerInvoices",
    description: "Get all invoices for a customer",
    endpoint: "GET /api/v1/people/{personId}/invoices",
    status: "enabled",
  },
  {
    id: "tool-5",
    name: "recordPayment",
    description: "Record a payment for an invoice",
    endpoint: "POST /api/v1/payments",
    status: "enabled",
  },
]

// Sample permissions data
const permissions = [
  {
    id: "perm-1",
    category: "Invoices",
    name: "Read Invoices",
    description: "View invoice details",
    granted: true,
  },
  {
    id: "perm-2",
    category: "Invoices",
    name: "Create Invoices",
    description: "Create new invoices",
    granted: true,
  },
  {
    id: "perm-3",
    category: "Invoices",
    name: "Update Invoices",
    description: "Modify existing invoices",
    granted: true,
  },
  {
    id: "perm-4",
    category: "Payments",
    name: "Record Payments",
    description: "Record payments for invoices",
    granted: true,
  },
  {
    id: "perm-5",
    category: "Customers",
    name: "Read Customer Data",
    description: "View customer information",
    granted: true,
  },
  {
    id: "perm-6",
    category: "Projects",
    name: "Read Projects",
    description: "View project details",
    granted: false,
  },
  {
    id: "perm-7",
    category: "Projects",
    name: "Update Projects",
    description: "Modify project details",
    granted: false,
  },
]

export default function AgentDetailPage({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the agent data based on the ID
  // If agent not found, return 404
  if (params.id !== "agent-1") {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/agent-workspace/agents">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{agent.name}</h1>
          {agent.status === "active" ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {agent.status === "active" ? (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
              Deactivate
            </Button>
          ) : (
            <Button
              variant="outline"
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700"
            >
              Activate
            </Button>
          )}
          <Button variant="destructive">Delete</Button>
        </div>
      </div>

      <p className="text-muted-foreground">{agent.description}</p>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Processed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.tasksProcessed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{agent.errorRate}%</div>
              {agent.errorRate < 2 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : agent.errorRate < 5 ? (
                <AlertTriangle className="h-5 w-5 text-amber-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.lastActivity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.model}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="configuration" className="space-y-4">
        <TabsList>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Configuration</CardTitle>
              <CardDescription>Configure the agent's basic settings and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" defaultValue={agent.name} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" defaultValue={agent.description} rows={2} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select defaultValue={agent.model}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea id="system-prompt" defaultValue={agent.systemPrompt} rows={6} />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="streaming" defaultChecked />
                <Label htmlFor="streaming">Enable streaming responses</Label>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Assigned Tools</h3>
                  <Button variant="outline" size="sm">
                    Manage Tools
                  </Button>
                </div>

                <div className="space-y-2">
                  {tools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.description}</div>
                        <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">{tool.endpoint}</code>
                      </div>
                      <Switch checked={tool.status === "enabled"} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Credentials</CardTitle>
              <CardDescription>Manage API keys and authentication for this agent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">API Key</h3>
                </div>

                <div className="p-4 border rounded-md bg-slate-50">
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      The API key is used by the agent to authenticate with the HomePro API. It should be kept secure
                      and only shared with trusted systems.
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex-1 font-mono text-sm bg-white border px-3 py-2 rounded-md">
                        ••••••••••••••••••••••••••••••••
                      </div>
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                        <span className="sr-only">Copy API key</span>
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Created on {new Date(agent.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm">
                      Regenerate Key
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      Revoke Key
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Rate Limiting</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="rate-limit">Maximum requests per minute</Label>
                    <Input id="rate-limit" type="number" defaultValue="60" className="w-24" />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="concurrent-limit">Maximum concurrent requests</Label>
                    <Input id="concurrent-limit" type="number" defaultValue="10" className="w-24" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Agent performance over the past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  tasks: {
                    label: "Tasks Completed",
                    color: "hsl(var(--chart-1))",
                  },
                  errors: {
                    label: "Errors",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="tasks" stroke="var(--color-tasks)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="var(--color-errors)"
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
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest tasks performed by this agent</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityData.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>{activity.type}</TableCell>
                      <TableCell>
                        {activity.status === "completed" ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleTimeString()}</TableCell>
                      <TableCell>{activity.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-center">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Permissions</CardTitle>
              <CardDescription>Control what this agent can access and modify</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {["Invoices", "Payments", "Customers", "Projects"].map((category) => {
                  const categoryPermissions = permissions.filter((p) => p.category === category)
                  return (
                    <div key={category} className="space-y-2">
                      <h3 className="text-lg font-medium">{category}</h3>
                      <div className="space-y-2">
                        {categoryPermissions.map((permission) => (
                          <div key={permission.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div>
                              <div className="font-medium">{permission.name}</div>
                              <div className="text-sm text-muted-foreground">{permission.description}</div>
                            </div>
                            <Switch checked={permission.granted} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <Button>Save Permissions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
