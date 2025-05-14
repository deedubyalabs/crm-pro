import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function JobNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h2 className="text-2xl font-bold">Job Not Found</h2>
      <p className="text-muted-foreground mt-2 mb-6">
        The job you are looking for does not exist or you don&apos;t have permission to view it.
      </p>
      <Button asChild>
        <Link href="/projects">Back to Projects</Link>
      </Button>
    </div>
  )
}
