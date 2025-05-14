import Link from "next/link"
import { jobService, JOB_STATUSES } from "@/lib/jobs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  Filter,
  MoreHorizontal,
  Search,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { projectService } from "@/lib/projects"
import { Progress } from "@/components/ui/progress"

interface JobsListProps {
  status?: string
  projectId?: string
  assignedToId?: string
  search?: string
  startDate?: string
  endDate?: string
}

export default async function JobsList({ status, projectId, assignedToId, search, startDate, endDate }: JobsListProps) {
  // Fetch jobs with filters
  const jobs = await jobService.getJobs({
    status,
    projectId,
    assignedToId,
    search,
    startDate,
    endDate,
  })

  // Fetch projects for filter
  const projects = await projectService.getProjects()

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

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <form>
            <Input
              type="search"
              name="search"
              placeholder="Search jobs..."
              className="w-full pl-8"
              defaultValue={search}
            />
          </form>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select name="status" defaultValue={status || ""}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {JOB_STATUSES.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select name="projectId" defaultValue={projectId || ""}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.project_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" title="More filters">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Jobs List */}
      {jobs.length > 0 ? (
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>All Jobs ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {jobs.map((job) => {
                const progress = jobService.calculateProgress(job)
                const isOverdue = jobService.isOverdue(job)

                return (
                  <div key={job.id} className="p-4 hover:bg-muted/50">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                            {job.name} {/* Changed from job_name to name */}
                          </Link>
                          {getStatusBadge(job.status)}
                          {isOverdue && (
                            <Badge variant="destructive" className="ml-2">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {job.project && (
                            <Link href={`/projects/${job.project.id}`} className="hover:underline">
                              <Building className="inline-block h-3.5 w-3.5 mr-1" />
                              {job.project.project_name}
                            </Link>
                          )}
                          {job.scheduled_start_date && (
                            <span className="ml-4">
                              <Calendar className="inline-block h-3.5 w-3.5 mr-1" />
                              {formatDate(job.scheduled_start_date)}
                            </span>
                          )}
                          {job.estimated_hours && (
                            <span className="ml-4">
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
                        {job.assigned_to ? (
                          <div className="flex items-center" title={`Assigned to: ${job.assigned_to.name}`}>
                            <User className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">{job.assigned_to.name}</span>
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
                              <Link href={`/jobs/${job.id}`}>View Details</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}/edit`}>Edit Job</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}/log-time`}>Log Time</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/jobs/${job.id}/assign`}>Assign Job</Link>
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
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-3 mb-4">
            <Clock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No jobs found</h3>
          <p className="text-muted-foreground mt-2 mb-6">
            {search
              ? "No jobs match your search criteria. Try adjusting your filters."
              : "Get started by creating your first job."}
          </p>
          <Button asChild>
            <Link href="/jobs/new">Create a new job</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
