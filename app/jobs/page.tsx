import { Suspense } from "react"
import type { Metadata } from "next"
import JobsList from "./jobs-list"
import JobsListSkeleton from "./jobs-list-skeleton"
import JobsPageClient from "./jobs-page-client" // Import the new client component

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
  const assignedToId = typeof awaitedSearchParams.assignedToId === "string" ? awaitedSearchParams.assignedToId : undefined
  const search = typeof awaitedSearchParams.search === "string" ? awaitedSearchParams.search : undefined
  const startDate = typeof awaitedSearchParams.startDate === "string" ? awaitedSearchParams.startDate : undefined
  const endDate = typeof awaitedSearchParams.endDate === "string" ? awaitedSearchParams.endDate : undefined

  return (
    <JobsPageClient
      status={status}
      projectId={projectId}
      assignedToId={assignedToId}
      search={search}
      startDate={startDate}
      endDate={endDate}
    />
  )
}
