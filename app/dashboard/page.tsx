import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Briefcase, Users, Calendar, BarChart, FileText, DollarSign, MapPin } from "lucide-react"
import { appointmentService } from "@/lib/tasks"
import { format, parseISO, isToday, isTomorrow, isThisWeek } from "date-fns"

export const metadata = {
  title: "Dashboard | HomePro One",
  description: "Overview of your business operations",
}

export default async function DashboardPage() {
  // Get upcoming tasks
  const today = new Date()
  const nextWeek = new Date(today)
  nextWeek.setDate(today.getDate() + 7)

  const upcomingTasks = await appointmentService.getTasks({
    startDate: today.toISOString(),
    endDate: nextWeek.toISOString(),
    status: "scheduled", // This will be mapped to "Scheduled" in the service
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your business operations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 new this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+5% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {upcomingTasks.length > 0
                ? `Next: ${formatTaskTime(upcomingTasks[0].start_time)}`
                : "No upcoming tasks"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Opportunities</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">Est. value: $125,000</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Your schedule for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingTasks.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex justify-between items-start">
                        <div>
                          <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                            {task.title}
                          </Link>
                          <div className="text-sm text-muted-foreground">
                            {task.person ? task.person.name : "No contact"}
                          </div>
                        </div>
                        <div className="text-sm text-right">
                          <div>{formatTaskDate(task.start_time)}</div>
                          <div>{format(parseISO(task.start_time), "h:mm a")}</div>
                        </div>
                      </div>
                    ))}
                    {upcomingTasks.length > 5 && (
                      <Button variant="link" className="w-full" asChild>
                        <Link href="/tasks">View all {upcomingTasks.length} tasks</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-4">No upcoming tasks</p>
                    <Button asChild>
                      <Link href="/tasks/new">Schedule an task</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your business operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-green-500 pl-4 py-1">
                    <p className="text-sm font-medium">New project created</p>
                    <p className="text-xs text-muted-foreground">Kitchen Remodel - Johnson Residence</p>
                  </div>
                  <div className="border-l-4 border-blue-500 pl-4 py-1">
                    <p className="text-sm font-medium">Task scheduled</p>
                    <p className="text-xs text-muted-foreground">Site visit - Smith Project (Tomorrow, 10:00 AM)</p>
                  </div>
                  <div className="border-l-4 border-amber-500 pl-4 py-1">
                    <p className="text-sm font-medium">Invoice paid</p>
                    <p className="text-xs text-muted-foreground">Invoice #1042 - $2,450.00</p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4 py-1">
                    <p className="text-sm font-medium">New lead created</p>
                    <p className="text-xs text-muted-foreground">Michael Brown - Kitchen renovation inquiry</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Quick Actions</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/people/new">
                      <Users className="mr-2 h-4 w-4" /> Add New Contact
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/tasks/new">
                      <Calendar className="mr-2 h-4 w-4" /> Schedule Task
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/opportunities/new">
                      <BarChart className="mr-2 h-4 w-4" /> Create Opportunity
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/projects/new">
                      <Briefcase className="mr-2 h-4 w-4" /> Start New Project
                    </Link>
                  </Button>
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href="/estimates/new">
                      <FileText className="mr-2 h-4 w-4" /> Create Estimate
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>Revenue and outstanding invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Monthly Revenue</h3>
                    <p className="text-2xl font-bold">$45,231</p>
                    <p className="text-xs text-green-600">+12.5% from last month</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Outstanding Invoices</h3>
                    <p className="text-2xl font-bold">$12,650</p>
                    <p className="text-xs text-amber-600">8 invoices pending</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="link" className="p-0" asChild>
                    <Link href="/invoices">
                      View all invoices <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Your schedule for the next 7 days</CardDescription>
              </div>
              <Button asChild>
                <Link href="/tasks/new">
                  <Calendar className="mr-2 h-4 w-4" /> New Task
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-4">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex justify-between items-start border-b pb-4">
                      <div>
                        <Link href={`/tasks/${task.id}`} className="font-medium hover:underline">
                          {task.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {task.person ? task.person.name : "No contact"}
                        </div>
                        {task.location && (
                          <div className="text-sm text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" /> {task.location}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-right">
                        <div>{formatTaskDate(task.start_time)}</div>
                        <div>{format(parseISO(task.start_time), "h:mm a")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No upcoming tasks</p>
                  <Button asChild>
                    <Link href="/tasks/new">Schedule an task</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Active Opportunities</CardTitle>
                <CardDescription>Your current sales pipeline</CardDescription>
              </div>
              <Button asChild>
                <Link href="/opportunities/new">
                  <BarChart className="mr-2 h-4 w-4" /> New Opportunity
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Opportunity data will be displayed here</p>
                <Button asChild>
                  <Link href="/opportunities">View all opportunities</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Your ongoing construction projects</CardDescription>
              </div>
              <Button asChild>
                <Link href="/projects/new">
                  <Briefcase className="mr-2 h-4 w-4" /> New Project
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">Project data will be displayed here</p>
                <Button asChild>
                  <Link href="/projects">View all projects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Helper function to format task date in a user-friendly way
function formatTaskDate(dateString: string): string {
  const date = parseISO(dateString)
  if (isToday(date)) {
    return "Today"
  } else if (isTomorrow(date)) {
    return "Tomorrow"
  } else if (isThisWeek(date)) {
    return format(date, "EEEE") // Day name
  } else {
    return format(date, "MMM d") // Month and day
  }
}

// Helper function to format task time in a user-friendly way
function formatTaskTime(dateString: string): string {
  const date = parseISO(dateString)
  if (isToday(date)) {
    return `Today at ${format(date, "h:mm a")}`
  } else if (isTomorrow(date)) {
    return `Tomorrow at ${format(date, "h:mm a")}`
  } else {
    return format(date, "EEE, MMM d 'at' h:mm a")
  }
}
