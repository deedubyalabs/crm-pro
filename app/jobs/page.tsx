import { Suspense } from "react"
import type { Metadata } from "next"
import JobsListSkeleton from "./jobs-list-skeleton"
import JobsPageClient from "./jobs-page-client" // Import the new client component
import { jobService } from "@/lib/jobs" // Import jobService
import { Database, Constants } from "@/types/supabase" // Import Database and Constants

export const metadata: Metadata = {
  title: "Jobs | PROActive ONE",
  description: "Manage and track all jobs across your projects",
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Await search parameters
  const awaitedSearchParams = await searchParams;

  // Extract search parameters
  const status = typeof awaitedSearchParams.status === "string" ? awaitedSearchParams.status : undefined
  const projectId = typeof awaitedSearchParams.projectId === "string" ? awaitedSearchParams.projectId : undefined
  const assignedTo = typeof awaitedSearchParams.assignedTo === "string" ? awaitedSearchParams.assignedTo : undefined // Changed from assignedToId to assignedTo
  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const startDate = typeof awaitedSearchParams.startDate === "string" ? awaitedSearchParams.startDate : undefined
  const endDate = typeof awaitedSearchParams.endDate === "string" ? awaitedSearchParams.endDate : undefined

  // Map incoming status to valid database enum values
  const validStatus = status ? 
    (['Pending', 'Scheduled', 'In Progress', 'Blocked', 'Completed', 'Canceled'].includes(status) ? 
      status as Database["public"]["Enums"]["job_status"] : 
      undefined) : 
    undefined;

  // Fetch jobs with filters
  const jobs = await jobService.getJobs({
    status: validStatus,
    projectId,
    assignedTo,
    search,
    startDate,
    endDate,
  })

  return (
    <JobsPageClient
      status={status}
      projectId={projectId}
      assignedTo={assignedTo} // Pass the renamed prop
      search={search}
      startDate={startDate}
      endDate={endDate}
      jobs={jobs} // Pass the fetched jobs to the client component
    />
  )
}
