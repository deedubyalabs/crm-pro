import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Bot, Plus, Search, MoreHorizontal, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Sample agent data
const agents = [
  {
    id: "agent-1",
    name: "InvoiceProcessor",
    description: "Processes and validates invoices, updates payment status",
    status: "active",
    lastActivity: "2 minutes ago",
    tasksProcessed: 112,
    errorRate: 1.8,
    model: "gpt-4o",
  },
  {
    id: "agent-2",
    name: "LeadQualifier",
    description: "Evaluates and scores new leads based on criteria",
    status: "active",
    lastActivity: "15 minutes ago",
    tasksProcessed: 87,
    errorRate: 7.5,
    model: "gpt-4o",
  },
  {
    id: "agent-3",
    name: "AppointmentScheduler",
    description: "Manages calendar and schedules appointments",
    status: "active",
    lastActivity: "32 minutes ago",
    tasksProcessed: 46,
    errorRate: 4.3,
    model: "gpt-4o",
  },
  {
    id: "agent-4",
    name: "ProjectManager",
    description: "Updates project status and manages tasks",
    status: "active",
    lastActivity: "1 hour ago",
    tasksProcessed: 68,
    errorRate: 2.9,
    model: "gpt-4o",
  },
  {
    id: "agent-5",
    name: "CustomerSupport",
    description: "Handles customer inquiries and support requests",
    status: "active",
    lastActivity: "1 hour ago",
    tasksProcessed: 75,
    errorRate: 10.7,
    model: "gpt-4o",
  },
  {
    id: "agent-6",
    name: "EstimateGenerator",
    description: "Creates cost estimates based on project requirements",
    status: "inactive",
    lastActivity: "2 days ago",
    tasksProcessed: 42,
    errorRate: 5.2,
    model: "gpt-4o",
  },
]

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage and monitor your intelligent agents</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Agent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Agent Management</CardTitle>
              <CardDescription>View and manage all configured agents</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search agents..." className="pl-8 w-[250px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Tasks Processed</TableHead>
                <TableHead>Error Rate</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {agent.status === "active" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>{agent.lastActivity}</TableCell>
                  <TableCell>{agent.tasksProcessed}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {agent.errorRate < 5 ? (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      ) : agent.errorRate < 10 ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      {agent.errorRate}%
                    </div>
                  </TableCell>
                  <TableCell>{agent.model}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/agent-workspace/agents/${agent.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {agent.status === "active" ? (
                          <DropdownMenuItem>Deactivate</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Activate</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Edit Configuration</DropdownMenuItem>
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
