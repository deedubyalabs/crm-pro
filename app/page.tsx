import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Bot, Briefcase, Users, Calendar } from "lucide-react"

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Welcome to PROActive OS</h1>
        <p className="text-muted-foreground">
          Agent-optimized business operations platform for home service professionals
        </p>
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
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Next: Today at 2:00 PM</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Processing 12 tasks today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Workspace</CardTitle>
            <CardDescription>Manage, monitor, and interact with your LLM agents</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Your intelligent agents are ready to help automate your business operations. Monitor their activity,
              configure their capabilities, and review their tasks.
            </p>
            <Button asChild>
              <Link href="/agent-workspace">
                Go to Agent Workspace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
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
                <p className="text-sm font-medium">Appointment scheduled</p>
                <p className="text-xs text-muted-foreground">Site visit - Smith Project (Tomorrow, 10:00 AM)</p>
              </div>
              <div className="border-l-4 border-amber-500 pl-4 py-1">
                <p className="text-sm font-medium">Invoice paid</p>
                <p className="text-xs text-muted-foreground">Invoice #1042 - $2,450.00</p>
              </div>
              <div className="border-l-4 border-purple-500 pl-4 py-1">
                <p className="text-sm font-medium">Agent completed task</p>
                <p className="text-xs text-muted-foreground">LeadQualifier processed 3 new leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
