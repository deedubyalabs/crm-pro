import React, { JSX } from "react"
import Link from "next/link"
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
import { projectService } from "@/lib/projects" // Keep projectService for project filter
import { Progress } from "@/components/ui/progress"
import JobListItemClient from "./job-list-item-client"
import { Job, JobWithAssignedToUser } from "@/types/job" // Import Job and JobWithAssignedToUser
import { Constants } from "@/types/supabase" // Import Constants

interface JobsListProps {
  jobs: Job[] // Jobs are now passed as a prop
  status?: string
  projectId?: string
  assignedTo?: string
  search?: string
  startDate?: string
  endDate?: string
  onJobClick?: (jobId: string) => void
}

export default function JobsList({ jobs, status, projectId, assignedTo, search, startDate, endDate, onJobClick }: JobsListProps) {
  // Fetch projects for filter (still needed for the Select component)
  // This should ideally be passed as a prop from the Server Component as well for full SSR,
  // but for now, keeping it here to avoid breaking the filter functionality immediately.
  // A more robust solution would involve passing `projects` from JobsPage to JobsPageClient to JobsList.
  const [projects, setProjects] = React.useState<any[]>([]); // Use React.useState
  React.useEffect(() => { // Use React.useEffect
    const fetchProjects = async () => {
      const fetchedProjects = await projectService.getProjects();
      setProjects(fetchedProjects);
    };
    fetchProjects();
  }, []);

  // Helper function to get status badge
  function getStatusBadge(status: string): JSX.Element {
    switch (status) {
      case "Pending":
        return <Badge variant="outline">Pending</Badge>
      case "Scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "In Progress":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In Progress</Badge>
      case "Blocked":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Blocked</Badge>
      case "Completed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>
      case "Canceled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>
      case "not_started":
        return <Badge variant="outline">Not Started</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      case "delayed":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Delayed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Helper function to get status icon
  function getStatusIcon(status: string): JSX.Element | null {
    switch (status) {
      case "Pending":
        return <PauseCircle className="h-4 w-4 text-muted-foreground" />
      case "Scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />
      case "In Progress":
        return <PlayCircle className="h-4 w-4 text-green-600" />
      case "Blocked":
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-purple-600" />
      case "Canceled":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "not_started":
        return <PauseCircle className="h-4 w-4 text-muted-foreground" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-green-600" />
      case "delayed":
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case "cancelled":
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
          <Select name="status" defaultValue={status || "all"}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {Object.values(Constants.public.Enums.job_status).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
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
                return (
                  <JobListItemClient
                    key={job.id}
                    job={job as JobWithAssignedToUser}
                    onJobClick={onJobClick || (() => {})}
                    calculateProgress={calculateProgress}
                    isOverdue={isOverdue}
                    getStatusBadge={getStatusBadge}
                    getStatusIcon={getStatusIcon}
                  />
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

// Helper functions for progress and overdue status (moved from JobService)
function calculateProgress(job: any): number {
  if (!job.estimated_hours || job.estimated_hours === 0) {
    return 0;
  }
  if (job.actual_hours === null) {
    return 0;
  }
  return Math.min(100, Math.round((job.actual_hours / job.estimated_hours) * 100));
}

function isOverdue(job: any): boolean {
  if (job.status === 'Completed' || job.status === 'Canceled') {
    return false;
  }
  if (job.due_date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(job.due_date);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }
  return false;
}
