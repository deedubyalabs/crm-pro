"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TaskService, Task } from "@/lib/task-service"
import { format } from "date-fns"

export default function ErrorLogsTab() {
  const [errorTasks, setErrorTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchErrorTasks = async () => {
      setLoading(true)
      setError(null)
      try {
        const fetchedTasks = await TaskService.getTasks()
        // Filter for tasks that have a 'failed' status or an 'error' property
        const filteredErrorTasks = fetchedTasks?.filter(
          (task) => task.status === "failed" || (task.error && task.error.length > 0)
        ) || []
        setErrorTasks(filteredErrorTasks)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchErrorTasks()
  }, [])

  const filteredTasks = errorTasks.filter(task =>
    task.run_id.toLowerCase().includes(searchTerm.toLowerCase()) || // Use run_id as task name
    task.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (task.error && task.error.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className="text-center py-8">Loading error logs...</div>
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Logs</CardTitle>
        <CardDescription>Review and debug errors from agent runs.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            placeholder="Search by task name, agent, or error message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No errors found.</div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Error Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{format(new Date(task.created_at), "MMM dd, yyyy HH:mm:ss")}</TableCell>
                    <TableCell>{task.agent_name}</TableCell>
                    <TableCell>{task.run_id}</TableCell>
                    <TableCell>
                      <Badge variant={task.status === "failed" ? "destructive" : "secondary"}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-red-500">{task.error || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
