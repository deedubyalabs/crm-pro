"use client"

import { useState, useEffect } from "react"
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
import { TaskService, Task } from "@/lib/task-service"

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
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedTasks = await TaskService.getTasks()
        setTasks(fetchedTasks || [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.input && JSON.stringify(task.input).toLowerCase().includes(searchTerm.toLowerCase())) || // Search in input JSON
      (task.output && JSON.stringify(task.output).toLowerCase().includes(searchTerm.toLowerCase())) || // Search in output JSON
      (task.error && task.error.toLowerCase().includes(searchTerm.toLowerCase())) || // Search in error message
      (task.metadata && JSON.stringify(task.metadata).toLowerCase().includes(searchTerm.toLowerCase())) // Search in metadata

    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

  const getRelatedEntitiesDisplay = (task: Task) => {
    if (task.metadata?.relatedEntities) {
      const entities = task.metadata.relatedEntities
      if (entities.person?.name) return `Person: ${entities.person.name}`
      if (entities.project?.name) return `Project: ${entities.project.name}`
      if (entities.invoice?.number) return `Invoice: ${entities.invoice.number}`
    }
    if (task.input) {
      // Attempt to extract common entity patterns from input
      const inputString = JSON.stringify(task.input)
      const personMatch = inputString.match(/"name"\s*:\s*"([^"]+)"/)
      if (personMatch) return `Input: ${personMatch[1]}`
    }
    return "N/A"
  }

  if (loading) {
    return <div className="text-center py-8">Loading tasks...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

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
              <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
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
                <Input
                  type="search"
                  placeholder="Search tasks..."
                  className="pl-8 w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Related Entity</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <ListTodo className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono text-sm">{task.run_id}</span>
                    </div>
                  </TableCell>
                  <TableCell>{task.agent_name}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{new Date(task.start_time).toLocaleTimeString()}</TableCell>
                  <TableCell>{formatDuration(task.start_time, task.end_time)}</TableCell>
                  <TableCell>{getRelatedEntitiesDisplay(task)}</TableCell>
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
