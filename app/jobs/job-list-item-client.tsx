"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  Clock,
  MoreHorizontal,
  User,
  Building,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { JobWithAssignedToUser } from "@/types/job" // Assuming this type exists
import { JSX } from "react"

interface JobListItemClientProps {
  job: JobWithAssignedToUser;
  onJobClick: (jobId: string) => void;
  calculateProgress: (job: any) => number; // Pass these helper functions
  isOverdue: (job: any) => boolean;
  getStatusBadge: (status: string) => JSX.Element;
  getStatusIcon: (status: string) => JSX.Element | null;
}

export default function JobListItemClient({
  job,
  onJobClick,
  calculateProgress,
  isOverdue,
  getStatusBadge,
  getStatusIcon,
}: JobListItemClientProps) {
  const progress = calculateProgress(job);
  const overdue = isOverdue(job);

  return (
    <div className="p-4 hover:bg-muted/50 cursor-pointer" onClick={() => onJobClick(job.id)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            {getStatusIcon(job.status)}
            <span className="font-medium">
              {job.name}
            </span>
            {getStatusBadge(job.status)}
            {overdue && (
              <Badge variant="destructive" className="ml-2">
                Overdue
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {job.project && (
              <Link href={`/projects/${job.project.id}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
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
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onJobClick(job.id)}>View Details</DropdownMenuItem>
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
  );
}
