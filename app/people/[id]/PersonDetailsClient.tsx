"use client";

import Link from "next/link"
import { formatPhoneNumber, formatDate, formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import EditPersonSheetTrigger from "@/components/crm/EditPersonSheetTrigger"
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
  MoreHorizontal,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Person } from "@/types/people";
import { Project } from "@/types/project";
import { DocumentWithRelations } from "@/types/documents";
import { User } from "@/types/auth"; // Import User type
import { Opportunity, TaskSummary } from "@/lib/opportunities"; // Correct import for Opportunity and TaskSummary

interface PersonDetailsClientProps {
  person: Person;
  opportunities: Opportunity[];
  projects: Project[];
  tasks: TaskSummary[];
  documents: DocumentWithRelations[];
  assignedUser: User | null; // Use User type
}

export default function PersonDetailsClient({
  person,
  opportunities,
  projects,
  tasks,
  documents,
  assignedUser,
}: PersonDetailsClientProps) {

  const opportunitiesCount = opportunities.length;
  const projectsCount = projects.length;
  const appointmentsCount = tasks.length;
  const documentsCount = documents.length;
  const activitiesCount = 0; // Still a placeholder

  const totalOpportunityValue = opportunities.reduce((sum, opp) => sum + (opp.estimated_value || 0), 0);
  const keyMetric = {
    label: "Opportunity Value",
    value: formatCurrency(totalOpportunityValue),
  };

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
  const displayName = person.first_name && person.last_name ? `${person.first_name} ${person.last_name}` : person.business_name || "";
  const personType = person.person_type.toLowerCase()

  return (
    <TooltipProvider>
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
                {person.lead_stage && (
                  <Badge variant="outline" className="text-xs">
                    Stage: {person.lead_stage}
                  </Badge>
                )}
                {person.tags && person.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Tag className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tags</p>
                      </TooltipContent>
                    </Tooltip>
                    {person.tags?.slice(0, 2).map((tag: string, i: number) => (
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MoreHorizontal className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>More Actions</p>
                    </TooltipContent>
                  </Tooltip>
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <EditPersonSheetTrigger person={person} />
                {personType === "lead" && (
                  <DropdownMenuItem asChild>
                    <Link className="text-12px" href={`/people/${person.id}/convert`}>Convert to Customer</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link className="text-12px" href={`/opportunities/new?personId=${person.id}`}>Create Opportunity</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link className="text-12px" href={`/tasks/new?personId=${person.id}`}>Send Meeting Link</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-12px">Create Estimate</DropdownMenuItem>
                <DropdownMenuItem className="text-12px">Log Activity</DropdownMenuItem>
                <DropdownMenuItem className="text-12px">Delete Contact</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6 text-[12px]">
                <h3 className="text-lg font-medium mb-4">Contact Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Email</p>
                      </TooltipContent>
                    </Tooltip>
                    {person.email ? (
                      <a href={`mailto:${person.email}`} className="hover:underline">
                        {person.email}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Phone</p>
                      </TooltipContent>
                    </Tooltip>
                    {person.phone ? (
                      <a href={`tel:${person.phone}`} className="hover:underline">
                        {formatPhoneNumber(person.phone)}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  <div className="flex items-start">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <MapPin className="h-4 w-4 mr-3 text-muted-foreground mt-0.5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Address</p>
                      </TooltipContent>
                    </Tooltip>
                    {addressParts.length > 0 ? (
                      <div>
                        {addressParts.map((part, index) => (
                          <div key={index}>{part}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </div>

                  <div className="flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <User2 className="h-4 w-4 mr-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Assigned To</p>
                      </TooltipContent>
                    </Tooltip>
                    <span>{assignedUser ? [assignedUser.first_name, assignedUser.last_name].filter(Boolean).join(' ') : 'Not assigned'}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <ClipboardList className="h-4 w-4 mr-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Lead Stage</p>
                        </TooltipContent>
                      </Tooltip>
                      {personType === "lead" && person.lead_stage ? (
                        <span>Stage: {person.lead_stage}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Date Added</p>
                        </TooltipContent>
                      </Tooltip>
                      <span>Added on {formatDate(person.created_at)}</span>
                    </div>

                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Clock className="h-4 w-4 mr-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last Contacted</p>
                        </TooltipContent>
                      </Tooltip>
                      {person.last_contacted_at ? (
                        <span>Last contacted on {formatDate(person.last_contacted_at)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>

                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DollarSign className="h-4 w-4 mr-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Opportunity Value</p>
                        </TooltipContent>
                      </Tooltip>
                      <span>
                        {keyMetric.label}: <strong>{keyMetric.value}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-[12px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Notes</h3>
                  <Button variant="outline" size="sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Edit className="mr-2 h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Notes</p>
                      </TooltipContent>
                    </Tooltip>
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
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-[12px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium">Tags</h3>
                  <Button variant="ghost" size="sm">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Edit className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit Tags</p>
                      </TooltipContent>
                    </Tooltip>
                    <span className="sr-only">Edit Tags</span>
                  </Button>
                </div>
                {person.tags && person.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {person.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No tags added yet.</p>
                )}
              </CardContent>
            </Card>

            {(personType === "business" || personType === "subcontractor") && (
              <Card>
                <CardHeader className="pb-3">
                  <h3 className="text-lg font-medium">Related Contacts</h3>
                </CardHeader>
                <CardContent className="text-[12px]">
                  <p className="text-sm text-muted-foreground">No related contacts found.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Tabs defaultValue="opportunities" className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="opportunities"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent text-[12px]"
                  >
                    Opportunities ({opportunitiesCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="projects"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent text-[12px]"
                  >
                    Projects ({projectsCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="tasks"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent text-[12px]"
                  >
                    Tasks ({appointmentsCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent text-[12px]"
                  >
                    Documents ({documentsCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent text-[12px]"
                  >
                    Activity ({activitiesCount})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="opportunities" className="p-0">
                  <div className="p-6 text-[12px]">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PlusCircle className="mr-2 h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Create New Opportunity</p>
                            </TooltipContent>
                          </Tooltip>
                          Create New Opportunity
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="p-0">
                  <div className="p-6 text-[12px]">
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <PlusCircle className="mr-2 h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Create New Project</p>
                            </TooltipContent>
                          </Tooltip>
                          Create New Project
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks" className="p-0">
                  <div className="p-6 text-[12px]">
                    {tasks.length > 0 ? (
                      <div className="space-y-4">
                        {tasks.map((task) => (
                          <div key={task.id} className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">{task.status}</Badge>
                                <span className="text-sm text-muted-foreground">{task.formatted_date} - {task.formatted_time}</span>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/tasks/${task.id}`}>View</Link>
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">No tasks found for this contact.</p>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button asChild>
                        <Link href={`/tasks/new?personId=${person.id}`}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CalendarClock className="mr-2 h-4 w-4" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Schedule Task</p>
                            </TooltipContent>
                          </Tooltip>
                          Schedule Task
                        </Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="documents" className="p-0">
                  <div className="p-6 text-[12px]">
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Upload className="mr-2 h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Upload Document</p>
                          </TooltipContent>
                        </Tooltip>
                        Upload Document
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="p-0">
                  <div className="p-6 text-[12px]">
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
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <MessageSquare className="mr-2 h-4 w-4" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Log Activity</p>
                          </TooltipContent>
                        </Tooltip>
                        Log Activity
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
