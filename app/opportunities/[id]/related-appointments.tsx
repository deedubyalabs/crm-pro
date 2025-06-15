import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { TaskSummary } from "@/lib/opportunities"

interface RelatedTasksProps {
  tasks: TaskSummary[]
  opportunityId: string
}

export function RelatedTasks({ tasks, opportunityId }: RelatedTasksProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No tasks found</h3>
        <p className="text-muted-foreground mt-2 mb-6">This opportunity doesn't have any tasks scheduled yet.</p>
        <Button asChild>
          <Link href={`/tasks/new?opportunityId=${opportunityId}`}>Schedule an task</Link>
        </Button>
      </div>
    )
  }

  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Scheduled
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Completed
          </Badge>
        )
      case "canceled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Canceled
          </Badge>
        )
      case "rescheduled":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Rescheduled
          </Badge>
        )
      case "no show":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            No Show
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Upcoming & Recent Tasks</h3>
        <Button asChild>
          <Link href={`/tasks/new?opportunityId=${opportunityId}`}>
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-base">{task.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {task.formatted_date}
                  </CardDescription>
                </div>
                {getStatusBadge(task.status)}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="flex items-center text-sm text-muted-foreground mb-3">
                <Clock className="h-3.5 w-3.5 mr-1" />
                {task.formatted_time}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {task.status === "Scheduled" && (
                    <>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/tasks/${task.id}/edit`}>Reschedule</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                <Button size="sm" variant="ghost" asChild>
                  <Link href={`/tasks/${task.id}`}>View Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
