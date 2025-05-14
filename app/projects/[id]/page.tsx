import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { getProjectById } from "@/lib/projects"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, FileText, ClipboardList, DollarSign, Pencil, Mic, ListTodo, Package } from "lucide-react"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  try {
    const project = await getProjectById(params.id)
    return {
      title: `${project.project_name} | HomePro OS`,
      description: `View details for project ${project.project_name}`,
    }
  } catch (error) {
    return {
      title: "Project Not Found | HomePro OS",
      description: "The requested project could not be found",
    }
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  try {
    const project = await getProjectById(params.id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{project.project_name}</h1>
          <Button asChild>
            <Link href={`/projects/${params.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.status}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{project.customer?.name || "No client assigned"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Start Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Not set"}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">End Date</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {project.end_date ? new Date(project.end_date).toLocaleDateString() : "Not set"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks for this project</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/jobs/new`}>
                  <ClipboardList className="mr-2 h-4 w-4" />
                  Add New Job
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/schedule`}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Project Schedule
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/material-lists`}>
                  <Package className="mr-2 h-4 w-4" />
                  Material Lists
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/takeoff`}>
                  <FileText className="mr-2 h-4 w-4" />
                  Takeoff & Materials
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/voice-notes`}>
                  <Mic className="mr-2 h-4 w-4" />
                  Voice Notes
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/projects/${params.id}/invoices/generate-invoice`}>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Generate Invoice
                </Link>
              </Button>
              <Button variant="outline" asChild className="justify-start">
                <Link href={`/calendar?projectId=${params.id}`}>
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="jobs">
          <TabsList>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="jobs" className="space-y-4">
            {/* Project Jobs Component */}
          </TabsContent>
          <TabsContent value="financial" className="space-y-4">
            {/* Financial Dashboard Component */}
          </TabsContent>
          <TabsContent value="schedule" className="space-y-4">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Intelligent Project Scheduling</h3>
              <p className="text-muted-foreground mb-4">
                Plan, optimize, and track your project schedule with our intelligent scheduling system.
              </p>
              <Button asChild>
                <Link href={`/projects/${params.id}/schedule`}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  View Project Schedule
                </Link>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
