
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { projectService } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, FileText, ClipboardList, DollarSign, Pencil, Mic, ListTodo, Package } from "lucide-react"
import ProjectPageClient from "@/components/projects/project-page-client" // Import the new client component

interface ProjectPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    // Await params.id to ensure it's resolved before use
    const projectId = await params.id;
    const project = await projectService.getProjectById(projectId)
    if (!project) {
      return {
        title: "Project Not Found | PROActive ONE",
        description: "The requested project could not be found",
      }
    }
    return {
      title: `${project.project_name} | PROActive ONE`,
      description: `View details for project ${project.project_name}`,
    }
  } catch (error) {
    return {
      title: "Project Not Found | PROActive ONE",
      description: "The requested project could not be found",
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  try {
    // Await params.id to ensure it's resolved before use
    const projectId = await params.id;
    const project = await projectService.getProjectById(projectId)

    if (!project) {
      notFound()
    }

    return (
      <ProjectPageClient project={project} projectId={projectId} />
    )
  } catch (error) {
    notFound()
  }
}
