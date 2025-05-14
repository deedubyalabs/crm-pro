import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function OpportunityNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="rounded-full bg-muted p-6 mb-6">
        <FileQuestion className="h-12 w-12 text-muted-foreground" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Opportunity Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The opportunity you're looking for doesn't exist or you may not have permission to view it.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild>
          <Link href="/opportunities">View All Opportunities</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/opportunities/new">Create New Opportunity</Link>
        </Button>
      </div>
    </div>
  )
}
