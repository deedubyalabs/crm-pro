import Link from "next/link"
import { projectService } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "@/lib/utils"
import {
  Clock,
  MoreHorizontal,
  PlusCircle,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ProjectJobsProps {
  projectId: string
}

export default async function ProjectJobs({ projectId }: ProjectJobsProps) {
  const jobs = await projectService.getProjectJobs(projectId)

  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "in progress":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>
      case "blocked":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Blocked</Badge>
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>
      case "canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get status icon
  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return <PauseCircle className="h-4 w-4 text-muted-foreground" />
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "in progress":
        return <PlayCircle className="h-4 w-4 text-green-600" />
      case "blocked":
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case "canceled":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  // Helper function to calculate progress
  function calculateProgress(job: any): number {
    if (job.status.toLowerCase() === "completed") return 100
    if (job.status.toLowerCase() === "canceled") return 0

    // If we have actual hours and estimated hours, calculate progress based on that
    if (job.actual_hours !== null && job.estimated_hours !== null && job.estimated_hours > 0) {
      const progress = Math.min(100, Math.round((job.actual_hours / job.estimated_hours) * 100))
      return progress
    }

    // Default progress based on status
    switch (job.status.toLowerCase()) {
      case "pending":
        return 0
      case "scheduled":
        return 10
      case "in progress":
        return 50
      case "blocked":
        return 50
      default:
        return 0
    }
  }

  // Helper function to check if a job is overdue
  function isOverdue(job: any): boolean {
    if (job.status.toLowerCase() === "completed" || job.status.toLowerCase() === "canceled") {
      return false
    }

    if (job.scheduled_end_date) {
      const endDate = new Date(job.scheduled_end_date)
      return endDate < new Date()
    }

    return false
  }

  return (
    <div className="p-6">
      {jobs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Jobs ({jobs.length})</h3>
            <Button asChild>
              <Link href={`/projects/${projectId}/jobs/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Job
              </Link>
            </Button>
          </div>

          <div className="divide-y">
            {jobs.map((job) => {
              const progress = calculateProgress(job)
              const jobIsOverdue = isOverdue(job)

              return (
                <div key={job.id} className="py-4 hover:bg-muted/50 -mx-6 px-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(job.status)}
                        <Link href={`/projects/${projectId}/jobs/${job.id}`} className="font-medium hover:underline">
                          {job.job_name}
                        </Link>
                        {getStatusBadge(job.status)}
                        {jobIsOverdue && (
                          <Badge variant="destructive" className="ml-2">
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {job.scheduled_start_date && (
                          <span className="mr-4">
                            <Calendar className="inline-block h-3.5 w-3.5 mr-1" />
                            {formatDate(job.scheduled_start_date)}
                          </span>
                        )}
                        {job.estimated_hours && (
                          <span>
                            <Clock className="inline-block h-3.5 w-3.5 mr-1" />
                            {job.actual_hours !== null
                              ? `${job.actual_hours}/${job.estimated_hours} hrs`
                              : `${job.estimated_hours} hrs`}
                          </span>
                        )}
                      </div>
                      {job.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">{job.description}</p>
                      )}
                      <div className="w-full mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {job.assigned_to_user_id ? (
                        <div className="flex items-center" title={`Assigned to: ${job.assigned_to_user_id}`}>
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span className="text-sm">{job.assigned_to_user_id}</span>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          Unassigned
                        </Badge>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${projectId}/jobs/${job.id}`}>View Details</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${projectId}/jobs/${job.id}/edit`}>Edit Job</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/projects/${projectId}/jobs/${job.id}/log-time`}>Log Time</Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete Job</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No jobs yet</h3>
          <p className="text-muted-foreground mt-2 mb-6">Get started by creating your first job for this project.</p>
          <Button asChild>
            <Link href={`/projects/${projectId}/jobs/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Job
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
