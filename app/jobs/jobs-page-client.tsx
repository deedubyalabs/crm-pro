"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import JobForm from "@/components/job-form"
import JobDetailDrawer from "@/components/job-detail-drawer"
import JobsList from "./jobs-list" // Assuming this is the existing JobsList component

interface JobsPageClientProps {
  status?: string
  projectId?: string
  assignedTo?: string // Renamed from assignedToId
  search?: string
  startDate?: string
  endDate?: string
}

export default function JobsPageClient({
  status,
  projectId,
  assignedTo, // Renamed from assignedToId
  search,
  startDate,
  endDate,
}: JobsPageClientProps) {
  const [isNewJobDrawerOpen, setIsNewJobDrawerOpen] = useState(false)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isJobDetailDrawerOpen, setIsJobDetailDrawerOpen] = useState(false)

  const handleOpenNewJobDrawer = () => {
    setIsNewJobDrawerOpen(true)
  }

  const handleCloseNewJobDrawer = () => {
    setIsNewJobDrawerOpen(false)
    // Optionally refresh the jobs list after creation/update
    // router.refresh() or re-fetch jobs
  }

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsJobDetailDrawerOpen(true)
  }

  const handleCloseJobDetailDrawer = () => {
    setIsJobDetailDrawerOpen(false)
    setSelectedJobId(null)
    // Optionally refresh the jobs list after update
    // router.refresh() or re-fetch jobs
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage and track all jobs across your projects</p>
        </div>
        <Button onClick={handleOpenNewJobDrawer}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Job
        </Button>
      </div>

      {/* Jobs List Component */}
      <JobsList
        status={status}
        projectId={projectId}
        assignedTo={assignedTo} // Pass the renamed prop
        search={search}
        startDate={startDate}
        endDate={endDate}
        onJobClick={handleJobClick} // Pass the click handler to JobsList
      />

      {/* New Job Drawer */}
      <Sheet open={isNewJobDrawerOpen} onOpenChange={(open) => !open && handleCloseNewJobDrawer()}>
        <SheetContent className="md:w-3/4 lg:w-1/2 xl:w-1/3 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Create New Job</SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <JobForm projectId={projectId || ""} onClose={handleCloseNewJobDrawer} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Job Detail Drawer */}
      {selectedJobId && (
        <JobDetailDrawer
          jobId={selectedJobId}
          projectId={projectId || ""} // Pass projectId, even if null for global jobs
          isOpen={isJobDetailDrawerOpen}
          onClose={handleCloseJobDetailDrawer}
        />
      )}
    </div>
  )
}
