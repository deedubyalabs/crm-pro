"use client"

import { useEffect, useState } from "react"
import apiClient from "@/lib/api-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"

interface ProjectJobsListProps {
  projectId: string
}

export default function ProjectJobsList({ projectId }: ProjectJobsListProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [isJobDetailDrawerOpen, setIsJobDetailDrawerOpen] = useState(false)

  useEffect(() => {
    async function fetchJobs() {
      if (!projectId) return
      setIsLoading(true)
      try {
        const response = await apiClient.get(`/api/jobs?project_id=${projectId}`)
        if (response.data) {
          setJobs(response.data as JobWithId[])
        } else {
          setJobs([])
          toast({
            title: "No Jobs Found",
            description: "No jobs found for this project.",
          })
        }
      } catch (error) {
        console.error("Failed to fetch jobs:", error)
        toast({
          title: "Error",
          description: "Failed to fetch jobs for this project.",
          variant: "destructive",
        })
        setJobs([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchJobs()
  }, [projectId])

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId)
    setIsJobDetailDrawerOpen(true)
  }

  const handleCloseJobDetailDrawer = () => {
    setIsJobDetailDrawerOpen(false)
    setSelectedJobId(null)
    // Optionally refresh jobs list if a job might have been updated
    // fetchJobs(); 
  }

  if (isLoading) {
    return <p>Loading jobs...</p>
  }

  if (jobs.length === 0) {
    return <p>No jobs found for this project.</p>
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleJobClick(job.id)}>
          <CardHeader>
            <CardTitle>{job.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Status: {job.status}</p>
            {/* Add more job details here if needed for the list view */}
          </CardContent>
        </Card>
      ))}

      {selectedJobId && (
        <JobDetailDrawer
          jobId={selectedJobId}
          isOpen={isJobDetailDrawerOpen}
          onClose={handleCloseJobDetailDrawer}
          projectId={projectId}
        />
      )}
    </div>
  )
}
