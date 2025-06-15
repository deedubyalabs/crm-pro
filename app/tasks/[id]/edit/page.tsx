import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { appointmentService } from "@/lib/tasks"
import TaskForm from "../../task-form"

export const metadata = {
  title: "Edit Task | HomePro One",
  description: "Edit task details",
}

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  const task = await appointmentService.getTaskById(params.id)

  if (!task) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/tasks/${task.id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Details</CardTitle>
          <CardDescription>Update the details for {task.title}</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm initialData={task} appointmentId={task.id} />
        </CardContent>
      </Card>
    </div>
  )
}
