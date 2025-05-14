import { Skeleton } from "@/components/ui/skeleton"

export default function TakeoffSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-[600px] w-full" />
    </div>
  )
}
