import { notFound } from "next/navigation"
import Link from "next/link"
import { jobService } from "@/lib/jobs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { Building, Calendar, CheckCircle, Clock, Edit, FileText, PlusCircle, User } from "lucide-react"
import JobStatusUpdater from "./job-status-updater"
import JobTimeLogger from "./job-time-logger"

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const job = await jobService.getJobById(params.id)

  if (!job) {
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

  const progress = jobService.calculateProgress(job)
  const timeRemaining = jobService.getTimeRemaining(job)
  const isOverdue = jobService.isOverdue(job)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{job.name}</h1> {/* Changed from job_name to name */}
            {getStatusBadge(job.status)}
            {isOverdue && (
              <Badge variant="destructive" className="ml-2">
                Overdue
              </Badge>
            )}
          </div>
          {job.project && (
            <div className="flex items-center mt-1">
              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
              <Link href={`/projects/${job.project.id}`} className="text-muted-foreground hover:underline">
                {job.project.project_name}
              </Link>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <JobStatusUpdater jobId={job.id} currentStatus={job.status} />
          <Button asChild variant="outline">
            <Link href={`/jobs/${job.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Job
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/jobs/${job.id}/log-time`}>
              <Clock className="mr-2 h-4 w-4" />
              Log Time
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Job Details */}
          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {job.description && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">{job.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium mb-2">Schedule</h3>
                  <div className="space-y-2">
                    {job.scheduled_start_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Start: {formatDate(job.scheduled_start_date)}</span>
                      </div>
                    )}
                    {job.scheduled_end_date && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">End: {formatDate(job.scheduled_end_date)}</span>
                      </div>
                    )}
                    {job.actual_start_date && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm">Started: {formatDate(job.actual_start_date)}</span>
                      </div>
                    )}
                    {job.actual_end_date && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        <span className="text-sm">Completed: {formatDate(job.actual_end_date)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Time Tracking</h3>
                  <div className="space-y-2">
                    {job.estimated_hours !== null && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Estimated: {job.estimated_hours} hours</span>
                      </div>
                    )}
                    {job.actual_hours !== null && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Logged: {job.actual_hours} hours</span>
                      </div>
                    )}
                    {timeRemaining !== null && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Remaining: {timeRemaining} hours</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Progress</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{progress}% Complete</span>
                    <span>
                      {job.status === "Completed"
                        ? "Completed"
                        : job.status === "Canceled"
                          ? "Canceled"
                          : "In Progress"}
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Assignment</h3>
                {job.assigned_to ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{job.assigned_to.name}</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Not assigned</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="time-logs" className="space-y-4">
            <TabsList>
              <TabsTrigger value="time-logs">Time Logs</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="time-logs">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Time Logs</CardTitle>
                  <JobTimeLogger jobId={job.id} />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No time logs yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                      Start tracking time for this job to see logs here.
                    </p>
                    <JobTimeLogger jobId={job.id} />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Notes</CardTitle>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No notes yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6">
                      Add notes to keep track of important information about this job.
                    </p>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Files</CardTitle>
                  <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No files yet</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Upload files related to this job for easy access.</p>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/jobs/${job.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Job
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/jobs/${job.id}/log-time`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Log Time
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/jobs/${job.id}/assign`}>
                  <User className="mr-2 h-4 w-4" />
                  Assign Job
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                Add Note
              </Button>
            </CardContent>
          </Card>

          {/* Related Items */}
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.project && (
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/projects/${job.project.id}`}>
                    <Building className="mr-2 h-4 w-4" />
                    View Project
                  </Link>
                </Button>
              )}
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href={`/calendar?jobId=${job.id}`}>
                  <Calendar className="mr-2 h-4 w-4" />
                  View in Calendar
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
