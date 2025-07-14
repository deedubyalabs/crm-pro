"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable } from "@/components/ui/data-table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { formatDate } from "@/lib/utils"
import { TaskWithRelations, TaskStatus, TaskType } from "@/types/tasks"
import { taskService } from "@/lib/tasks"

interface RelatedTasksProps {
  tasks: TaskWithRelations[]
  opportunityId: string
}

export function RelatedTasks({ tasks, opportunityId }: RelatedTasksProps) {
  const handleDelete = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId)
      toast({
        title: "Task Deleted",
        description: "The task has been successfully deleted.",
      })
      // Optionally, refresh the page or update state to reflect the deletion
      window.location.reload();
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<TaskWithRelations>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "task_name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const task = row.original
        return (
          <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
            {task.task_name}
          </Link>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status: TaskStatus = row.getValue("status")
        const getStatusBadge = (status: TaskStatus) => {
          switch (status) {
            case TaskStatus.Open:
              return <Badge variant="outline">Open</Badge>
            case TaskStatus.InProgress:
              return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
            case TaskStatus.Completed:
              return <Badge className="bg-green-100 text-green-800 hover:bg-green-800">Completed</Badge>
            case TaskStatus.Cancelled:
              return <Badge className="bg-red-100 text-red-800 hover:bg-red-800">Cancelled</Badge>
            default:
              return <Badge variant="outline">{status}</Badge>
          }
        }
        return getStatusBadge(status)
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type: TaskType = row.getValue("type")
        const getTypeBadge = (type: TaskType) => {
          switch (type) {
            case TaskType.PhoneCall:
              return <Badge variant="secondary">Phone Call</Badge>
            case TaskType.Appointment:
              return <Badge variant="secondary">Appointment</Badge>
            case TaskType.Email:
              return <Badge variant="secondary">Email</Badge>
            case TaskType.Reminder:
              return <Badge variant="secondary">Reminder</Badge>
            case TaskType.ToDo:
              return <Badge variant="secondary">To Do</Badge>
            case TaskType.VideoChat:
              return <Badge variant="secondary">Video Chat</Badge>
            default:
              return <Badge variant="outline">{type}</Badge>
          }
        }
        return getTypeBadge(type)
      },
    },
    {
      accessorKey: "due_date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Due Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("due_date") as string | null
        return <div>{date ? formatDate(date) : "N/A"}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const task = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}`}>View Task</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/tasks/${task.id}/edit`}>Edit Task</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleDelete(task.id)}>
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {tasks.length > 0 ? (
        <DataTable columns={columns} data={tasks} searchKey="task_name" />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No tasks found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            No tasks have been scheduled for this opportunity yet.
          </p>
          <Button asChild>
            <Link href={`/tasks/new?opportunityId=${opportunityId}`}>Schedule New Task</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
