import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function JobsListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search jobs..." className="w-full pl-8" disabled />
        </div>
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>

      <Card className="p-0">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-5 w-32" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 last:border-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}
