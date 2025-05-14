import { Suspense } from "react"
import type { Metadata } from "next"
import JobsList from "./jobs-list"
import JobsListSkeleton from "./jobs-list-skeleton"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Jobs | HomePro OS",
  description: "Manage and track all jobs across your projects",
}

export default function JobsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Extract search parameters
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined
  const projectId = typeof searchParams.projectId === "string" ? searchParams.projectId : undefined
  const assignedToId = typeof searchParams.assignedToId === "string" ? searchParams.assignedToId : undefined
  const search = typeof searchParams.search === "string" ? searchParams.search : undefined
  const startDate = typeof searchParams.startDate === "string" ? searchParams.startDate : undefined
  const endDate = typeof searchParams.endDate === "string" ? searchParams.endDate : undefined

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">Manage and track all jobs across your projects</p>
        </div>
        <Button asChild>
          <Link href="/jobs/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Job
          </Link>
        </Button>
      </div>

      <Suspense fallback={<JobsListSkeleton />}>
        <JobsList
          status={status}
          projectId={projectId}
          assignedToId={assignedToId}
          search={search}
          startDate={startDate}
          endDate={endDate}
        />
      </Suspense>
    </div>
  )
}
