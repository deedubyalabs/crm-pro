import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, BarChart, AlertTriangle } from "lucide-react"
import { projectService } from "@/lib/projects"
import { schedulerService } from "@/lib/scheduler-service"
import ProjectScheduleGantt from "./project-schedule-gantt"
import ResourceAllocationChart from "./resource-allocation-chart"
import ScheduleConflictsList from "./schedule-conflicts-list"
import WeatherImpactsList from "./weather-impacts-list"
import ScheduleAnalysisSummary from "./schedule-analysis-summary"
import ScheduleOptimizeButton from "./schedule-optimize-button"
import ScheduleGenerateButton from "./schedule-generate-button"

export const metadata = {
  title: "Project Schedule | PROActive OS",
  description: "Intelligent project scheduling and resource allocation",
}

export default async function ProjectSchedulePage({ params }: { params: { id: string } }) {
  try {
    // Get project details
    const project = await projectService.getProjectById(params.id)
    if (!project) {
      notFound()
    }

    // Get project tasks
    const tasks = await schedulerService.getProjectTasks({ projectId: params.id })

    // Get scheduling conflicts
    const conflicts = await schedulerService.getSchedulingConflicts(params.id)

    // Get schedule analysis if tasks exist
    let analysis = null
    if (tasks.length > 0) {
      analysis = await schedulerService.analyzeSchedule(params.id)
    }

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/projects/${params.id}`}>
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Project Schedule</h1>
              <p className="text-muted-foreground">{project.project_name}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <ScheduleGenerateButton projectId={params.id} hasExistingTasks={tasks.length > 0} />
            {tasks.length > 0 && <ScheduleOptimizeButton projectId={params.id} />}
          </div>
        </div>

        {tasks.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Schedule Found</CardTitle>
              <CardDescription>
                This project doesn't have a schedule yet. Generate a schedule to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ScheduleGenerateButton projectId={params.id} hasExistingTasks={false} size="lg" />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Gantt chart view of project tasks and dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectScheduleGantt tasks={tasks} />
              </CardContent>
            </Card>

            {conflicts.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                    <CardTitle>Scheduling Conflicts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScheduleConflictsList conflicts={conflicts} tasks={tasks} />
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="analysis">
              <TabsList>
                <TabsTrigger value="analysis">
                  <BarChart className="h-4 w-4 mr-2" />
                  Schedule Analysis
                </TabsTrigger>
                <TabsTrigger value="resources">
                  <Calendar className="h-4 w-4 mr-2" />
                  Resource Allocation
                </TabsTrigger>
                <TabsTrigger value="weather">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Weather Impacts
                </TabsTrigger>
              </TabsList>
              <TabsContent value="analysis" className="mt-4">
                {analysis && <ScheduleAnalysisSummary analysis={analysis} />}
              </TabsContent>
              <TabsContent value="resources" className="mt-4">
                <ResourceAllocationChart tasks={tasks} />
              </TabsContent>
              <TabsContent value="weather" className="mt-4">
                {analysis && <WeatherImpactsList weatherImpacts={analysis.weatherImpacts} />}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    )
  } catch (error) {
    console.error("Error loading project schedule:", error)
    notFound()
  }
}
