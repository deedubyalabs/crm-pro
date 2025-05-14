import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import ProjectForm from "../project-form"
import { estimateService } from "@/lib/estimates" // Import estimateService
import type { EstimateWithDetails } from "@/types/estimates" // Import EstimateWithDetails
import { personService } from "@/lib/people" // Import personService
import type { Person } from "@/lib/people" // Import Person type from lib/people

export const metadata = {
  title: "New Project | HomePro One",
  description: "Create a new construction or renovation project",
}

interface NewProjectPageProps {
  searchParams: {
    estimateId?: string;
  };
}

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  let estimate: EstimateWithDetails | null = null;
  let person: Person | null = null; // State for person data

  if (searchParams.estimateId) {
    try {
      // Fetch the estimate if estimateId is provided
      const fetchedEstimate = await estimateService.getEstimateById(searchParams.estimateId);
      // Ensure the fetched estimate is "Accepted" before using it for pre-filling
      if (fetchedEstimate?.status === 'Accepted') {
        estimate = fetchedEstimate;
        // Fetch person details if estimate is found and has a person_id
        if (estimate.person_id) {
          person = await personService.getPersonById(estimate.person_id);
        }
      }
    } catch (error) {
      console.error("Error fetching estimate or person:", error);
      // Keep estimate and person as null if fetch fails
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>Enter the details for your new project</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm initialEstimate={estimate} initialPerson={person} /> {/* Pass estimate and person data */}
        </CardContent>
      </Card>
    </div>
  )
}
