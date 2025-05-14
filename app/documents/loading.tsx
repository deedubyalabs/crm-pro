import { Skeleton } from "@/components/ui/skeleton"
import { FileText } from "lucide-react"

export default function DocumentsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-4 w-[350px] mt-2" />
        </div>
        <Skeleton className="h-10 w-[150px]" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-[400px]" />
        <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-muted-foreground" />
                <div>
                  <Skeleton className="h-5 w-[150px]" />
                  <div className="flex items-center space-x-2 mt-1">
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="p-4 pt-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex flex-wrap gap-2 mt-2">
                <Skeleton className="h-5 w-[100px] rounded-full" />
                <Skeleton className="h-5 w-[80px] rounded-full" />
              </div>
              <div className="flex justify-between items-center mt-3">
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
