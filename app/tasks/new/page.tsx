import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft } from "lucide-react"
import TaskForm from "../task-form"

export const metadata = {
  title: "New Task | HomePro One",
  description: "Schedule a new task",
}

export default function NewTaskPage() {
  return (
    <Dialog open={true} onOpenChange={(open) => {
      if (!open) {
        // Navigate back to the tasks list when the dialog is closed
        window.location.href = "/tasks";
      }
    }}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Button variant="outline" size="icon" asChild className="mr-2">
              <Link href="/tasks">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            New Task
          </DialogTitle>
          <DialogDescription>Enter the details for your new task</DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <TaskForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}
