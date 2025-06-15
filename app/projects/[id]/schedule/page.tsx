import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, BarChart, AlertTriangle } from "lucide-react"
import { projectService } from "@/lib/projects"
import { projectJobService } from "@/lib/scheduler/project-job-service"
import { schedulingConflictService } from "@/lib/scheduler/scheduling-conflict-service"
import { scheduleAnalysisService } from "@/lib/scheduler/schedule-analysis-service"
import ProjectScheduleGantt from "./project-schedule-gantt"
import ResourceAllocationChart from "./resource-allocation-chart"
import ScheduleConflictsList from "./schedule-conflicts-list"
import WeatherImpactsList from "./weather-impacts-list"
import ScheduleAnalysisSummary from "./schedule-analysis-summary"
import ScheduleOptimizeButton from "./schedule-optimize-button"
import ScheduleGenerateButton from "./schedule-generate-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

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

    // Get project tasks (jobs)
    const jobs = await projectJobService.getProjectJobs({ projectId: params.id })

    // Get scheduling conflicts
    const conflicts = await schedulingConflictService.getSchedulingConflicts(params.id)

    // Get schedule analysis if tasks exist
    let analysis = null
    if (jobs.length > 0) {
      analysis = await scheduleAnalysisService.analyzeSchedule(params.id)
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
            <ScheduleGenerateButton projectId={params.id} projectName={project.project_name} hasExistingJobs={jobs.length > 0} />
            {jobs.length > 0 && <ScheduleOptimizeButton projectId={params.id} />}
          </div>
        </div>

        {jobs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Schedule Found</CardTitle>
              <CardDescription>
                This project doesn't have a schedule yet. Generate a schedule to get started.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <ScheduleGenerateButton projectId={params.id} projectName={project.project_name} hasExistingJobs={false} size="lg" />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
                <CardDescription>Gantt chart view of project jobs and dependencies</CardDescription>
              </CardHeader>
              <CardContent>
                <ProjectScheduleGantt jobs={jobs} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Jobs List</CardTitle>
                <CardDescription>A simple list view of all jobs in this project</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Assignee</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{job.status}</Badge>
                        </TableCell>
                        <TableCell>{job.scheduled_start_date ? format(new Date(job.scheduled_start_date), "PPP") : "N/A"}</TableCell>
                        <TableCell>{job.scheduled_end_date ? format(new Date(job.scheduled_end_date), "PPP") : "N/A"}</TableCell>
                        <TableCell>{job.assigned_to || "Unassigned"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                  <ScheduleConflictsList conflicts={conflicts} jobs={jobs} />
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
