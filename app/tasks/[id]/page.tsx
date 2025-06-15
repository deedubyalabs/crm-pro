import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Calendar, Clock, MapPin, User, Pencil, LinkIcon } from "lucide-react"
import { appointmentService } from "@/lib/tasks"
import { formatDateTime } from "@/lib/utils"

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // Await params before accessing its properties
  const task = await appointmentService.getTaskById((await params).id)

  if (!task) {
    notFound()
  }

  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Scheduled</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>
      case "completed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Completed</Badge>
      case "canceled": // Corrected typo from 'cancelled'
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Canceled</Badge>
      case "rescheduled":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Rescheduled</Badge>
      case "no show": // Added missing enum value
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No Show</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Calculate duration in minutes
  const start = new Date(task.start_time)
  const end = new Date(task.end_time)
  const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">{task.appointment_type}</h1> {/* Use appointment_type */}
          {getStatusBadge(task.status)}
        </div>
        <div className="flex space-x-2">
          {task.status !== "Completed" && task.status !== "Canceled" && ( // Use correct enum values
            <>
              <Button variant="outline" asChild>
                <Link href={`/tasks/${task.id}/reschedule`}>Reschedule</Link>
              </Button>
              <Button variant="outline" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  <LinkIcon className="mr-2 h-4 w-4" /> Cal.com Link
                </a>
              </Button>
            </>
          )}
          <Button asChild>
            <Link href={`/tasks/${task.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Task
            </Link>
          </Button>
        </div>
      </div>

      {task.notes && <p className="text-muted-foreground">{task.notes}</p>} {/* Use notes for description */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              {task.person ? (
                <Link href={`/people/${task.person.id}`} className="hover:underline">
                  {task.person.name}
                </Link>
              ) : (
                <span className="text-muted-foreground">No contact</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Date & Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{formatDateTime(task.start_time)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{durationMinutes} minutes</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              {task.address ? ( // Use address
                <span>{task.address}</span>
              ) : (
                <span className="text-muted-foreground">No location</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="related">Related Items</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Status</h3>
                  <p>{task.status}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium">Assigned To</h3>
                  {/* assigned_to is not in Supabase schema, remove or map to created_by_user_id if needed */}
                  <p>{task.created_by_user_id || "Unassigned"}</p> {/* Mapped to created_by_user_id */}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium">Timeline</h3>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="text-xs text-muted-foreground">
                    <p>Created</p>
                    <p>{formatDateTime(task.created_at)}</p>
                  </div>
                  <div className="h-8 border-l border-muted"></div>
                  <div className="text-xs text-muted-foreground">
                    <p>Last Updated</p>
                    <p>{formatDateTime(task.updated_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Related Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium">Contact</h3>
                  {task.person ? (
                    <Link href={`/people/${task.person.id}`} className="hover:underline">
                      {task.person.name}
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">No contact associated</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium">Opportunity</h3>
                  {task.opportunity ? (
                    <Link href={`/opportunities/${task.opportunity.id}`} className="hover:underline">
                      {task.opportunity.title}
                    </Link>
                  ) : (
                    <p className="text-muted-foreground">No opportunity associated</p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium">Project</h3>
                {task.project ? (
                  <Link href={`/projects/${task.project.id}`} className="hover:underline">
                    {task.project.name}
                  </Link>
                ) : (
                  <p className="text-muted-foreground">No project associated</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Notes</h2>
            <Button>
              <Pencil className="mr-2 h-4 w-4" /> Add Note
            </Button>
          </div>
          <Separator />
          {task.notes ? (
            <div className="prose max-w-none">
              <p>{task.notes}</p>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">No notes have been added to this task</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
