import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function JobNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-red-100 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Job Not Found</h1>
      <p className="text-muted-foreground mt-2 mb-6">The job you're looking for doesn't exist or has been removed.</p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/jobs">View All Jobs</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/jobs/new">Create New Job</Link>
        </Button>
      </div>
    </div>
  )
}
