import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { personService } from "@/lib/people"
import { formatPhoneNumber, formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input" // Import Input
import LeadAISection from "@/components/crm/LeadAISection" // Import LeadAISection
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import EditPersonSheetTrigger from "@/components/crm/EditPersonSheetTrigger" // Import EditPersonSheetTrigger
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  User2,
  CalendarClock,
  PlusCircle,
  FileText,
  Clock,
  Building2,
  DollarSign,
  ClipboardList,
  Upload,
  MessageSquare,
  Edit,
  Tag,
  MoreHorizontal, // Added for dropdown menu
} from "lucide-react"

// Added for dropdown menu
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

// Add imports at the top
import { opportunityService } from "@/lib/opportunities";
import { projectService } from "@/lib/projects";
import { appointmentService } from "@/lib/appointments";
import { documentService } from "@/lib/documents";
import { authService } from "@/lib/auth-service";
import { AppointmentSummary } from "@/lib/opportunities"; // Import AppointmentSummary
import { DocumentWithRelations } from "@/types/documents"; // Import DocumentWithRelations

export default async function PersonPage({ params }: { params: { id: string } }) {
  // Check if the ID is "new" and redirect to the new person page
  const awaitedParams = await params;
  if (awaitedParams.id === "new") {
    redirect("/people/new")
  }

  const person = await personService.getPersonById(awaitedParams.id).catch(() => null)

  if (!person) {
    notFound()
  }

  // Fetch related data
  const opportunities = await opportunityService.getOpportunities({ personId: person.id });
  const projects = await projectService.getProjects({ customerId: person.id });
  const appointments = await appointmentService.getAppointments({ personId: person.id }) as unknown as AppointmentSummary[];
  const documents = await documentService.getDocuments({ personId: person.id });
  const assignedUser = person.id ? await authService.getUserById(person.id) : null;

  // Update counts
  const opportunitiesCount = opportunities.length;
  const projectsCount = projects.length;
  const appointmentsCount = appointments.length;
  const documentsCount = documents.length;
  const activitiesCount = 0; // Still a placeholder

  // Calculate key metric (e.g., total estimated value of opportunities)
  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const keyMetric = {
    label: "Opportunity Value", // Changed label
    value: formatCurrency(totalOpportunityValue),
  };

  // Helper function to get type badge
  function getTypeBadge(type: string) {
    const lowerType = type.toLowerCase()
    switch (lowerType) {
      case "customer":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Customer</Badge>
      case "lead":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Lead</Badge>
      case "business":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Business</Badge>
      case "subcontractor":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Subcontractor</Badge>
      case "employee":
        return <Badge className="bg-pink-100 text-pink-800 hover:bg-pink-100">Employee</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Format the address for display
  const formatAddress = () => {
    const parts = []
    if (person.address_line1) parts.push(person.address_line1)
    if (person.address_line2) parts.push(person.address_line2)

    let cityStateZip = ""
    if (person.city) cityStateZip += person.city
    if (person.state_province) {
      if (cityStateZip) cityStateZip += ", "
      cityStateZip += person.state_province
    }
    if (person.postal_code) {
      if (cityStateZip) cityStateZip += " "
      cityStateZip += person.postal_code
    }

    if (cityStateZip) parts.push(cityStateZip)
    if (person.country) parts.push(person.country)

    return parts
  }

  const addressParts = formatAddress()
  const displayName = personService.getDisplayName(person)
  const personType = person.person_type.toLowerCase()

   return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {getInitials(person.first_name, person.last_name, person.business_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{displayName}</h1>
            <div className="flex flex-wrap items-center mt-1 gap-2">
              {getTypeBadge(person.person_type)}
              {person.lead_source && (
                <Badge variant="outline" className="text-xs">
                  Source: {person.lead_source}
                </Badge>
              )}
              {/* Display Lead Stage */}
              {person.lead_stage && (
                <Badge variant="outline" className="text-xs">
                  Stage: {person.lead_stage}
                </Badge>
              )}
              {person.tags && person.tags.length > 0 && (
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {person.tags.slice(0, 2).map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {person.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{person.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EditPersonSheetTrigger person={person} />
              {personType === "lead" && (
                <DropdownMenuItem asChild>
                  <Link href={`/people/${person.id}/convert`}>Convert to Customer</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log Activity</DropdownMenuItem> {/* Placeholder */}
              <DropdownMenuItem asChild>
                <Link href={`/opportunities/new?personId=${person.id}`}>Create Opportunity</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/appointments/new?personId=${person.id}`}>Schedule Appointment</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Add Job</DropdownMenuItem> {/* Placeholder */}
              <DropdownMenuItem>Create AI Estimate</DropdownMenuItem> {/* Placeholder */}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete Contact</DropdownMenuItem> {/* Placeholder */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6"> {/* Adjusted grid columns */}
        <div className="lg:col-span-3"> {/* Adjusted column span for left column */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Core Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                  <div className="space-y-4">
                    {person.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                        <a href={`mailto:${person.email}`} className="hover:underline">
                          {person.email}
                        </a>
                      </div>
                    )}

                    {person.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                        <a href={`tel:${person.phone}`} className="hover:underline">
                          {formatPhoneNumber(person.phone)}
                        </a>
                      </div>
                    )}

                    {addressParts.length > 0 && (
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                        <div>
                          {addressParts.map((part, index) => (
                            <div key={index}>{part}</div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assigned To */}
                    <div className="flex items-center">
                      <User2 className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span>{assignedUser ? [assignedUser.first_name, assignedUser.last_name].filter(Boolean).join(' ') : 'Not assigned'}</span> {/* Display assigned user */}
                      {/* TODO: Implement editability for assigned user */}
                    </div>
                  </div>
                </div>

                {/* Right Column: Key Context & Stats */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Key Information</h3>
                  <div className="space-y-4">
                    {/* Display Lead Stage in Key Information */}
                    {personType === "lead" && person.lead_stage && (
                       <div className="flex items-center">
                         <ClipboardList className="h-5 w-5 mr-3 text-muted-foreground" />
                         <span>Stage: {person.lead_stage}</span>
                       </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span>Added on {formatDate(person.created_at)}</span>
                    </div>

                    {/* AI Qualification */}
                    <div className="flex items-center">
                      <ClipboardList className="h-5 w-5 mr-3 text-muted-foreground" /> {/* Using ClipboardList for now, could be a different icon */}
                      <span>AI Qualification: <strong className="text-muted-foreground">Pending AI Analysis</strong></span> {/* Placeholder */}
                    </div>

                    {person.last_contacted_at && (
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                        <span>Last contacted on {formatDate(person.last_contacted_at)}</span>
                      </div>
                    )}

                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-3 text-muted-foreground" />
                      <span>
                        {keyMetric.label}: <strong>{keyMetric.value}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Notes</h3>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Notes
                  </Button>
                </div>
                {person.notes ? (
                  <div className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm">{person.notes}</div>
                ) : (
                  <div className="bg-muted p-4 rounded-md text-sm text-muted-foreground">
                    No notes available for this contact.
                  </div>
                )}
              </div>

              {/* Tags Section (Moved from Right Sidebar) */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit Tags</span>
                  </Button>
                </div>
                <CardContent className="p-0"> {/* Removed padding as it's now inside another CardContent */}
                  {person.tags && person.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {person.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No tags added yet.</p>
                  )}
                </CardContent>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Area */}
          <Card className="mt-6">
            <Tabs defaultValue="opportunities" className="w-full">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                <TabsTrigger
                  value="opportunities"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Opportunities ({opportunitiesCount})
                </TabsTrigger>
                <TabsTrigger
                  value="projects"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Projects ({projectsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="appointments"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Appointments ({appointmentsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Documents ({documentsCount})
                </TabsTrigger>
                <TabsTrigger
                  value="activity"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Activity ({activitiesCount})
                </TabsTrigger>
                <TabsTrigger
                  value="ai-insights"
                  className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  AI Insights
                </TabsTrigger>
              </TabsList>

              {/* Opportunities Tab */}
              <TabsContent value="opportunities" className="p-0">
                <div className="p-6">
                  {opportunities.length > 0 ? (
                    <div className="space-y-4">
                      {opportunities.map((opportunity) => (
                        <div key={opportunity.id} className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{opportunity.opportunity_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{opportunity.status}</Badge>
                              {opportunity.estimated_value !== null && (
                                <span className="text-sm text-muted-foreground">{formatCurrency(opportunity.estimated_value)}</span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/opportunities/${opportunity.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No opportunities found for this contact.</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button asChild>
                      <Link href={`/opportunities/new?personId=${person.id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Opportunity
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Projects Tab */}
              <TabsContent value="projects" className="p-0">
                <div className="p-6">
                  {projects.length > 0 ? (
                    <div className="space-y-4">
                      {projects.map((project) => (
                        <div key={project.id} className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{project.project_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{project.status}</Badge>
                              {project.budget_amount !== null && (
                                <span className="text-sm text-muted-foreground">{formatCurrency(project.budget_amount)}</span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/projects/${project.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No projects found for this contact.</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button asChild>
                      <Link href={`/projects/new?personId=${person.id}`}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create New Project
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments" className="p-0">
                <div className="p-6">
                  {appointments.length > 0 ? (
                    <div className="space-y-4">
                      {appointments.map((appointment) => (
                        <div key={appointment.id} className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{appointment.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{appointment.status}</Badge>
                              <span className="text-sm text-muted-foreground">{appointment.formatted_date} - {appointment.formatted_time}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/appointments/${appointment.id}`}>View</Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No appointments found for this contact.</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button asChild>
                      <Link href={`/appointments/new?personId=${person.id}`}>
                        <CalendarClock className="mr-2 h-4 w-4" />
                        Schedule Appointment
                      </Link>
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Documents Tab */}
              <TabsContent value="documents" className="p-0">
                <div className="p-6">
                  {documents.length > 0 ? (
                    <div className="space-y-4">
                      {documents.map((document) => (
                        <div key={document.id} className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{document.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{document.document_type}</Badge>
                              <span className="text-sm text-muted-foreground">Uploaded: {formatDate(document.created_at)}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No documents found for this contact.</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Document
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="p-0">
                <div className="p-6">
                  {/* TODO: Fetch and render real activity data */}
                  {activitiesCount > 0 ? (
                    <div className="space-y-4">
                      {/* This would be a real list in production */}
                       {/* Example structure for a real activity item: */}
                      {/*
                      <div className="bg-muted/50 p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{activity.type}</Badge>
                            <h4 className="font-medium">{activity.title}</h4>
                          </div>
                          <span className="text-sm text-muted-foreground">{formatDate(activity.date)}</span>
                        </div>
                        <p className="mt-2 text-sm">
                          {activity.description}
                        </p>
                      </div>
                      */}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No activity found for this contact.</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Button>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Log Activity
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* AI Insights Tab */}
              <TabsContent value="ai-insights" className="p-0">
                <div className="p-6">
                  <LeadAISection personId={person.id} personType={person.person_type} />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Related Contacts - TODO: Implement with real data from backend */}
          {(personType === "business" || personType === "subcontractor") && (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-lg font-medium">Related Contacts</h3>
              </CardHeader>
              <CardContent>
                {/* TODO: Fetch and render real related contacts data */}
                <p className="text-sm text-muted-foreground">No related contacts found.</p> {/* Placeholder */}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
