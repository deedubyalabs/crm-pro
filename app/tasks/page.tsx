import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import TasksList from "./tasks-list";
import TasksListSkeleton from "./tasks-list-skeleton";

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Manage your daily actions and appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/tasks/new">
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>A list of all your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<TasksListSkeleton />}>
            <TasksList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
