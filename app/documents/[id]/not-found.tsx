import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DocumentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold">Document Not Found</h1>
      <p className="text-muted-foreground mt-2 mb-6 max-w-md">
        The document you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild>
        <Link href="/documents">Back to Documents</Link>
      </Button>
    </div>
  )
}
