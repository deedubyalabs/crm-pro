import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-48" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-2">
                <Skeleton className="col-span-6 h-4" />
                <Skeleton className="col-span-1 h-4" />
                <Skeleton className="col-span-2 h-4" />
                <Skeleton className="col-span-1 h-4" />
                <Skeleton className="col-span-2 h-4" />
              </div>

              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2">
                    <Skeleton className="col-span-6 h-6" />
                    <Skeleton className="col-span-1 h-6" />
                    <Skeleton className="col-span-2 h-6" />
                    <Skeleton className="col-span-1 h-6" />
                    <Skeleton className="col-span-2 h-6" />
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>

              <div className="flex justify-between">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
