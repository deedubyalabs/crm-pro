import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="rounded-md border">
        <div className="p-4">
          <Skeleton className="h-8 w-full max-w-sm" />
        </div>
        <div className="border-t">
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
