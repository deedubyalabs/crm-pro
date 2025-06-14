"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, FileText, ClipboardList, DollarSign, Pencil, Mic, ListTodo, Package, Lightbulb, MessageSquareText, LayoutDashboard } from "lucide-react"
import ClientOnly from "@/components/ClientOnly"
import ProjectJobsList from "@/components/projects/project-jobs-list"
import BlueprintOfValuesList from "@/components/projects/blueprint-of-values-list"

export default function ProjectPageClient({ project, projectId }: { project: any, projectId: string }) {
  const [isInsightsDrawerOpen, setIsInsightsDrawerOpen] = useState(false)

  const handleOpenInsightsDrawer = () => {
    setIsInsightsDrawerOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">{project.project_name}</h1>
        <div className="flex space-x-2">
          <ClientOnly>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOpenInsightsDrawer}
              title="AI Insights & Suggestions"
            >
              <MessageSquareText className="h-4 w-4" />
            </Button>
          </ClientOnly>
          <Button asChild>
            <Link href={`/projects/${projectId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
        </div>
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
              {project.planned_start_date ? new Date(project.planned_start_date).toLocaleDateString() : "Not set"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">End Date</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.planned_end_date ? new Date(project.planned_end_date).toLocaleDateString() : "Not set"}
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
              <Link href={`/projects/${projectId}/jobs/new`}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Add New Job
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/projects/${projectId}/schedule`}>
                <ListTodo className="mr-2 h-4 w-4" />
                Project Schedule
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/projects/${projectId}/material-lists`}>
                <Package className="mr-2 h-4 w-4" />
                Material Lists
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/projects/${projectId}/takeoff`}>
                <FileText className="mr-2 h-4 w-4" />
                Takeoff & Materials
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/projects/${projectId}/invoices/generate-invoice`}>
                <DollarSign className="mr-2 h-4 w-4" />
                Generate Invoice
              </Link>
            </Button>
            <Button variant="outline" asChild className="justify-start">
              <Link href={`/calendar?projectId=${projectId}`}>
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
          <TabsTrigger value="bov">Blueprint of Values</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>
        <TabsContent value="jobs" className="space-y-4">
          <ProjectJobsList projectId={projectId} />
        </TabsContent>
        <TabsContent value="bov" className="space-y-4">
          <BlueprintOfValuesList projectId={projectId} />
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
              <Link href={`/projects/${projectId}/schedule`}>
                <ListTodo className="mr-2 h-4 w-4" />
                View Project Schedule
              </Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
