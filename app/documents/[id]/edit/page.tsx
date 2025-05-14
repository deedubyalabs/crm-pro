import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { documentService } from "@/lib/documents"
import { DocumentForm } from "../../document-form"
import { supabase } from "@/lib/supabase"

export const metadata: Metadata = {
  title: "Edit Document | HomePro One",
  description: "Edit document details",
}

interface EditDocumentPageProps {
  params: {
    id: string
  }
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const document = await documentService.getDocumentById(params.id)

  if (!document) {
    notFound()
  }

  // Fetch projects, jobs, people, and opportunities for the form
  const [projectsResponse, jobsResponse, peopleResponse, opportunitiesResponse] = await Promise.all([
    supabase.from("projects").select("id, project_name").order("project_name"),
    supabase.from("jobs").select("id, job_name").order("job_name"),
    supabase.from("people").select("id, first_name, last_name, business_name").order("last_name"),
    supabase.from("opportunities").select("id, opportunity_name").order("opportunity_name"),
  ])

  if (projectsResponse.error || jobsResponse.error || peopleResponse.error || opportunitiesResponse.error) {
    console.error("Error fetching data:", {
      projects: projectsResponse.error,
      jobs: jobsResponse.error,
      people: peopleResponse.error,
      opportunities: opportunitiesResponse.error,
    })
    redirect(`/documents/${params.id}?error=fetch-failed`)
  }

  // Transform the data for the form
  const projects = projectsResponse.data.map((project) => ({
    id: project.id,
    name: project.project_name,
  }))

  const jobs = jobsResponse.data.map((job) => ({
    id: job.id,
    name: job.job_name,
  }))

  const people = peopleResponse.data.map((person) => ({
    id: person.id,
    name: person.business_name || `${person.first_name || ""} ${person.last_name || ""}`.trim(),
  }))

  const opportunities = opportunitiesResponse.data.map((opportunity) => ({
    id: opportunity.id,
    title: opportunity.opportunity_name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
        <p className="text-muted-foreground">Update document details and associations</p>
      </div>

      <div className="border rounded-lg p-6">
        <DocumentForm
          document={document}
          projects={projects}
          jobs={jobs}
          people={people}
          opportunities={opportunities}
        />
      </div>
    </div>
  )
}
