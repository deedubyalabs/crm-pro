import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, ListTodo, CheckCircle, XCircle, Clock, RotateCw, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Sample tasks data
const tasks = [
  {
    id: "task-1",
    agent: "LeadQualifier",
    type: "Lead Qualification",
    status: "failed",
    startTime: "2023-05-03T14:45:00Z",
    duration: "12s",
    relatedEntities: {
      person: { id: "person-1", name: "John Smith" },
    },
  },
  {
    id: "task-2",
    agent: "InvoiceProcessor",
    type: "Invoice Processing",
    status: "completed",
    startTime: "2023-05-03T14:30:00Z",
    duration: "8s",
    relatedEntities: {
      invoice: { id: "invoice-1", number: "INV-1042" },
    },
  },
  {
    id: "task-3",
    agent: "CustomerSupport",
    type: "Email Response",
    status: "pending_approval",
    startTime: "2023-05-03T14:15:00Z",
    duration: "15s",
    relatedEntities: {
      person: { id: "person-2", name: "Sarah Johnson" },
    },
  },
  {
    id: "task-4",
    agent: "AppointmentScheduler",
    type: "Appointment Creation",
    status: "completed",
    startTime: "2023-05-03T14:00:00Z",
    duration: "10s",
    relatedEntities: {
      person: { id: "person-3", name: "Michael Brown" },
      project: { id: "project-1", name: "Kitchen Remodel" },
    },
  },
  {
    id: "task-5",
    agent: "ProjectManager",
    type: "Status Update",
    status: "completed",
    startTime: "2023-05-03T13:45:00Z",
    duration: "6s",
    relatedEntities: {
      project: { id: "project-2", name: "Bathroom Renovation" },
    },
  },
  {
    id: "task-6",
    agent: "LeadQualifier",
    type: "Lead Qualification",
    status: "running",
    startTime: "2023-05-03T15:00:00Z",
    duration: "3s (ongoing)",
    relatedEntities: {
      person: { id: "person-4", name: "Emily Wilson" },
    },
  },
  {
    id: "task-7",
    agent: "CustomerSupport",
    type: "Follow-up Scheduling",
    status: "queued",
    startTime: "Pending",
    duration: "-",
    relatedEntities: {
      person: { id: "person-5", name: "David Thompson" },
    },
  },
]

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status) {
    case "completed":
      return (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
        </div>
      )
    case "failed":
      return (
        <div className="flex items-center">
          <XCircle className="h-4 w-4 text-red-500 mr-1" />
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
        </div>
      )
    case "running":
      return (
        <div className="flex items-center">
          <RotateCw className="h-4 w-4 text-blue-500 mr-1 animate-spin" />
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Running</Badge>
        </div>
      )
    case "queued":
      return (
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-slate-500 mr-1" />
          <Badge className="bg-slate-100 text-slate-800 hover:bg-slate-100">Queued</Badge>
        </div>
      )
    case "pending_approval":
      return (
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending Approval</Badge>
        </div>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Monitor and manage agent tasks</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Task Monitoring</CardTitle>
              <CardDescription>Track the execution of individual agent tasks</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="pending_approval">Pending Approval</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search tasks..." className="pl-8 w-[250px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Related Entities</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{task.id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{task.agent}</TableCell>
                  <TableCell>{task.type}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    {task.startTime === "Pending" ? "Pending" : new Date(task.startTime).toLocaleTimeString()}
                  </TableCell>
                  <TableCell>{task.duration}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {task.relatedEntities.person && (
                        <div className="text-sm">
                          Person: <span className="font-medium">{task.relatedEntities.person.name}</span>
                        </div>
                      )}
                      {task.relatedEntities.project && (
                        <div className="text-sm">
                          Project: <span className="font-medium">{task.relatedEntities.project.name}</span>
                        </div>
                      )}
                      {task.relatedEntities.invoice && (
                        <div className="text-sm">
                          Invoice: <span className="font-medium">{task.relatedEntities.invoice.number}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
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
                          <Link href={`/agent-workspace/tasks/${task.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {task.status === "failed" && <DropdownMenuItem>Retry Task</DropdownMenuItem>}
                        {task.status === "pending_approval" && (
                          <>
                            <DropdownMenuItem className="text-green-600">Approve</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Reject</DropdownMenuItem>
                          </>
                        )}
                        {task.status === "running" && (
                          <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>View Logs</DropdownMenuItem>
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
