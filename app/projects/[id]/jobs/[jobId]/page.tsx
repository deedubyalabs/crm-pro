import { notFound } from "next/navigation"
import Link from "next/link"
import { projectService } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { ArrowLeft, Calendar, Clock, Edit, FileText, PlayCircle, User } from "lucide-react"
import JobForm from "@/components/job-form"

export default async function JobPage({ params }: { params: { id: string; jobId: string } }) {
  // Special case: if the jobId is "new", redirect to the new job page
  if (params.jobId === "new") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Job</h1>
          <p className="text-muted-foreground">Create a new job for this project.</p>
        </div>

        {/* Import and use the JobForm component */}
        {/* @ts-expect-error Async Server Component */}
        <JobForm projectId={params.id} />
      </div>
    )
  }

  const job = await projectService.getJobById(params.jobId).catch(() => null)

  if (!job || job.project_id !== params.id) {
    notFound()
  }

  const project = await projectService.getProjectById(params.id).catch(() => null)

  if (!project) {
    notFound()
  }

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

  const progress = calculateProgress(job)
  const jobIsOverdue = isOverdue(job)

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="h-8 w-8">
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to project</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{job.job_name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {getStatusBadge(job.status)}
              <Link href={`/projects/${params.id}`} className="text-sm text-muted-foreground hover:underline">
                {project.project_name}
              </Link>
              {jobIsOverdue && (
                <Badge variant="destructive" className="ml-2">
                  Overdue
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/projects/${params.id}/jobs/${job.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${params.id}/jobs/${job.id}/log-time`}>
              <Clock className="mr-2 h-4 w-4" />
              Log Time
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/projects/${params.id}/jobs/${job.id}/update-status`}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Update Status
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-medium">Job Details</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.description && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Description</h3>
                  <p className="text-sm">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Schedule</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Start: {job.scheduled_start_date ? formatDate(job.scheduled_start_date) : "Not scheduled"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        End: {job.scheduled_end_date ? formatDate(job.scheduled_end_date) : "Not scheduled"}
                      </span>
                    </div>
                    {job.actual_start_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm">Started: {formatDate(job.actual_start_date)}</span>
                      </div>
                    )}
                    {job.actual_end_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                        <span className="text-sm">Completed: {formatDate(job.actual_end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Time & Progress</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Estimated: {job.estimated_hours ? `${job.estimated_hours} hours` : "Not estimated"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        Actual: {job.actual_hours ? `${job.actual_hours} hours` : "No time logged"}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Assigned to: {job.assigned_to_user_id || "Unassigned"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Progress</h3>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span>{progress}% Complete</span>
                  <span>100%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <h2 className="text-lg font-medium">Time Logs</h2>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No time logs found for this job.</p>
                <Button asChild>
                  <Link href={`/projects/${params.id}/jobs/${job.id}/log-time`}>
                    <Clock className="mr-2 h-4 w-4" />
                    Log Time
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <h2 className="text-lg font-medium">Quick Actions</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/projects/${params.id}/jobs/${job.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Job
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/projects/${params.id}/jobs/${job.id}/log-time`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Log Time
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/projects/${params.id}/jobs/${job.id}/update-status`}>
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Update Status
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/projects/${params.id}/jobs/${job.id}/notes`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Add Notes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader className="pb-3">
              <h2 className="text-lg font-medium">Related Items</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/projects/${params.id}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
