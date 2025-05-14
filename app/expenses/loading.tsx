import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ExpensesLoading() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-8 w-24 mx-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-8 w-24 mx-auto" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Skeleton className="h-4 w-32 mx-auto mb-2" />
              <Skeleton className="h-8 w-24 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
              <Skeleton className="h-4 w-full max-w-[100px]" />
            </div>

            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-4 border-t">
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
