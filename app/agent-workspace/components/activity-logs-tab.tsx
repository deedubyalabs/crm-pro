"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, CheckCircle, XCircle, AlertTriangle, ListTodo } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskService, Task } from "@/lib/task-service"

// Helper function to get status badge (reused from tasks/page.tsx)
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
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Running</Badge>
        </div>
      )
    case "queued":
      return (
        <div className="flex items-center">
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

export default function ActivityLogsTab() {
  const [logs, setLogs] = useState<Task[]>([]) // Using Task type for logs
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      setError(null)
      try {
        // Assuming TaskService.getTasks can serve as activity logs
        const fetchedTasks = await TaskService.getTasks()
        setLogs(fetchedTasks || [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.input && JSON.stringify(log.input).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.output && JSON.stringify(log.output).toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.error && log.error.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.metadata && JSON.stringify(log.metadata).toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || log.status === statusFilter

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

  const getRelatedEntitiesDisplay = (log: Task) => {
    if (log.metadata?.relatedEntities) {
      const entities = log.metadata.relatedEntities
      if (entities.person?.name) return `Person: ${entities.person.name}`
      if (entities.project?.name) return `Project: ${entities.project.name}`
      if (entities.invoice?.number) return `Invoice: ${entities.invoice.number}`
    }
    if (log.input) {
      const inputString = JSON.stringify(log.input)
      const personMatch = inputString.match(/"name"\s*:\s*"([^"]+)"/)
      if (personMatch) return `Input: ${personMatch[1]}`
    }
    return "N/A"
  }

  if (loading) {
    return <div className="text-center py-8">Loading activity logs...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>Historical record of all agent activities</CardDescription>
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
                placeholder="Search logs..."
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
              <TableHead>Timestamp</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Related Entity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.start_time).toLocaleString()}</TableCell>
                <TableCell>{log.agent_name}</TableCell>
                <TableCell>{getStatusBadge(log.status)}</TableCell>
                <TableCell>{formatDuration(log.start_time, log.end_time)}</TableCell>
                <TableCell>
                  {getRelatedEntitiesDisplay(log)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
