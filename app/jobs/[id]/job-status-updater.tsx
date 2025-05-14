"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { JOB_STATUSES, type JobStatus } from "@/lib/jobs"
import { CheckCircle, Clock, AlertCircle, XCircle, PlayCircle, PauseCircle, ChevronDown } from "lucide-react"

interface JobStatusUpdaterProps {
  jobId: string
  currentStatus: string
}

export default function JobStatusUpdater({ jobId, currentStatus }: JobStatusUpdaterProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Helper function to get status icon
  function getStatusIcon(status: string) {
    switch (status.toLowerCase()) {
      case "pending":
        return <PauseCircle className="h-4 w-4" />
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "in progress":
        return <PlayCircle className="h-4 w-4" />
      case "blocked":
        return <AlertCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "canceled":
        return <XCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  async function updateStatus(status: JobStatus) {
    if (status === currentStatus) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("Failed to update job status")
      }

      toast({
        title: "Status updated",
        description: `Job status has been updated to ${status}`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" disabled={isLoading}>
          {getStatusIcon(currentStatus)}
          <span className="ml-2">Update Status</span>
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {JOB_STATUSES.map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => updateStatus(status as JobStatus)}
            disabled={status === currentStatus || isLoading}
            className={status === currentStatus ? "bg-muted" : ""}
          >
            {getStatusIcon(status)}
            <span className="ml-2">{status}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
