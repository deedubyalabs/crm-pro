import { cookies } from "next/headers"
import Link from "next/link"
import { validateClientPortalSession, getClientDashboardData } from "@/lib/client-portal-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, CreditCard, FileCheck, Building } from "lucide-react"
import { ClientNotifications } from "./components/client-notifications"
import { ClientInvoicesList } from "./components/client-invoices-list"
import { ClientDocumentsList } from "./components/client-documents-list"
import { ClientProjectsList } from "./components/client-projects-list"

export default async function ClientPortalDashboard() {
  const cookieStore = cookies()
  const sessionToken = cookieStore.get("client_portal_token")?.value

  if (!sessionToken) {
    return null // This should be handled by the layout redirect
  }

  const user = await validateClientPortalSession(sessionToken)

  if (!user) {
    return null // This should be handled by the layout redirect
  }

  const dashboardData = await getClientDashboardData(user.id, user.customer_id)

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {user.first_name || "Client"}</h1>
          <p className="text-muted-foreground">Here's an overview of your projects and important updates</p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/client-portal/messages">Contact Us</Link>
          </Button>
          <Button asChild>
            <Link href="/client-portal/invoices">View Invoices</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.projects.length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.invoices.upcoming}</div>
            <p className="text-xs text-muted-foreground">Upcoming payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.documents.needsSignature}</div>
            <p className="text-xs text-muted-foreground">Awaiting signature</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Change Orders</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.changeOrders.pending}</div>
            <p className="text-xs text-muted-foreground">Pending approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="projects" className="w-full">
            <TabsList>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            <TabsContent value="projects">
              <Card>
                <CardHeader>
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription>Overview of your current projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientProjectsList projects={dashboardData.projects} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Invoices</CardTitle>
                  <CardDescription>Your most recent invoices and payment status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientInvoicesList invoices={dashboardData.invoices.recent} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="documents">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Documents shared with you</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientDocumentsList documents={dashboardData.documents.recent} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <ClientNotifications notifications={dashboardData.notifications} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
