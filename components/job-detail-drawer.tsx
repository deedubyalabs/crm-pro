"use client"

import { useEffect, useState } from "react"
import apiClient from "@/lib/api-client"
import { Job } from "@/types/job" // Assuming Job type is defined
import JobForm from "@/components/job-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { toast } from "@/components/ui/use-toast"

interface JobDetailDrawerProps {
  jobId: string | null
  projectId: string
  isOpen: boolean
  onClose: () => void
}

export default function JobDetailDrawer({ jobId, projectId, isOpen, onClose }: JobDetailDrawerProps) {
  const [jobData, setJobData] = useState<any | null>(null) // Consider using a more specific type e.g. JobFormValues
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function fetchJobDetails() {
      if (!jobId || !isOpen) {
        setJobData(null) // Clear data if drawer is closed or no jobId
        return
      }
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/api/jobs/${jobId}`)
        if (response.data) {
          setJobData(response.data)
        } else {
          toast({
            title: "Error",
            description: "Job details not found.",
            variant: "destructive",
          })
          onClose() // Close drawer if job not found
        }
      } catch (error) {
        console.error("Failed to fetch job details:", error)
        toast({
          title: "Error",
          description: "Failed to fetch job details.",
          variant: "destructive",
        })
        onClose() // Close drawer on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [jobId, isOpen, onClose])

  if (!isOpen) {
    return null
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="md:w-3/4 lg:w-1/2 xl:w-1/3 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isLoading ? "Loading Job..." : jobData ? "Edit Job" : "Job Details"}</SheetTitle>
          {jobData && <SheetDescription>Update the details for {jobData.name}.</SheetDescription>}
        </SheetHeader>
        <div className="py-4">
          {isLoading && <p>Loading job details...</p>}
          {!isLoading && jobData && (
            <JobForm
              projectId={projectId}
              initialData={jobData}
              jobId={jobData.id}
              onClose={onClose}
            />
          )}
          {!isLoading && !jobData && jobId && <p>Could not load job details.</p>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
