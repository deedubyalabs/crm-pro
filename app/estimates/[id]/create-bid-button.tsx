"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react" // Changed icon

interface CreateProjectButtonProps { // Renamed interface
  estimateId: string
}

// Renamed component and updated functionality
export function CreateProjectButton({ estimateId }: CreateProjectButtonProps) {
  return (
    <Button asChild> {/* Removed variant="outline" to make it a primary action */}
      <Link href={`/projects/new?estimateId=${estimateId}`}> {/* Changed link destination and added query param */}
        <PlusCircle className="mr-2 h-4 w-4" /> {/* Changed icon */}
        Create Project from this Estimate {/* Changed button text */}
      </Link>
    </Button>
  )
}
