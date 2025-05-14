import JobsListSkeleton from "./jobs-list-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function JobsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      <JobsListSkeleton />
    </div>
  )
}
