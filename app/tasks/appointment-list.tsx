import { appointmentService } from "@/lib/tasks"
import { formatDateTime } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Calendar, MapPin, User, Clock } from "lucide-react"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "scheduled":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
    case "completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case "canceled":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
    case "rescheduled":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Rescheduled</Badge>
    case "no show":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function TaskList({
  status,
  search,
  personId,
  opportunityId,
  projectId,
  from,
  to,
}: {
  status?: string
  search?: string
  personId?: string
  opportunityId?: string
  projectId?: string
  from?: string
  to?: string
}) {
  const filters = {
    status,
    search,
    personId,
    opportunityId,
    projectId,
    startDate: from,
    endDate: to,
  }

  const tasks = await appointmentService.getTasks(filters)

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Calendar className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No tasks found</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md">
          {search
            ? `No tasks match your search "${search}"`
            : status
              ? `No ${status} tasks found`
              : "Get started by creating your first task"}
        </p>
        <Button asChild>
          <Link href="/tasks/new">Schedule an task</Link>
        </Button>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Date & Time</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead>Location</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          // Calculate duration in minutes
          const start = new Date(task.start_time)
          const end = new Date(task.end_time)
          const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

          return (
            <TableRow key={task.id}>
              <TableCell>
                <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                  {task.appointment_type}
                </Link>
                {task.notes && <p className="text-sm text-muted-foreground line-clamp-1">{task.notes}</p>}
              </TableCell>
              <TableCell>{getStatusBadge(task.status)}</TableCell>
              <TableCell>
                {task.person ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Link href={`/people/${task.person.id}`} className="hover:underline">
                      {task.person.name}
                    </Link>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No contact</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  {formatDateTime(task.start_time)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  {durationMinutes} min
                </div>
              </TableCell>
              <TableCell>
                {task.address ? (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{task.address}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">No location</span>
                )}
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
                      <Link href={`/tasks/${task.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/tasks/${task.id}/edit`}>Edit Task</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {task.status !== "completed" && (
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}/complete`}>Mark as Completed</Link>
                      </DropdownMenuItem>
                    )}
                    {task.status !== "canceled" && (
                      <DropdownMenuItem asChild>
                        <Link href={`/tasks/${task.id}/cancel`}>Cancel Task</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete Task</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
