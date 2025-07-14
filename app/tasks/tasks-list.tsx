"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { taskService } from "@/lib/tasks";
import { type TaskWithRelations, TaskStatus } from "@/types/tasks";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import TasksListSkeleton from "./tasks-list-skeleton";

export default function TasksList() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      setIsLoading(true);
      try {
        const fetchedTasks = await taskService.getTasks();
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        });
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(id);
        setTasks(tasks.filter((task) => task.id !== id));
        toast({
          title: "Success",
          description: "Task deleted successfully.",
        });
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: "Failed to delete task. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  function getStatusColor(status: TaskStatus | null) {
    switch (status) {
      case TaskStatus.Open:
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case TaskStatus.InProgress:
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case TaskStatus.Completed:
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case TaskStatus.Cancelled:
        return "bg-red-100 text-red-800 hover:bg-red-100";
      default:
        return "";
    }
  }

  if (isLoading) {
    return <TasksListSkeleton />;
  }

  if (tasks.length === 0) {
    return <p>No tasks found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead>Assigned To</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">
              <Link href={`/tasks/${task.id}`} className="hover:underline">
                {task.task_name}
              </Link>
            </TableCell>
            <TableCell>{task.type}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
            </TableCell>
            <TableCell>
              {task.end_time ? format(new Date(task.end_time), "PPP") : "N/A"}
            </TableCell>
            <TableCell>
              {task.person ? `${task.person.first_name} ${task.person.last_name}` : "Unassigned"}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/tasks/${task.id}`}>View</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/tasks/${task.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(task.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
