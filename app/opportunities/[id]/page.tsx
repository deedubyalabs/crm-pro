"use client" // Convert to client component

import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Pencil,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  History,
  Copy, // Import Copy icon
} from "lucide-react"
import { opportunityService, NewOpportunity } from "@/lib/opportunities" // Import NewOpportunity
import { formatCurrency, formatDate } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { RelatedTasks } from "./related-tasks"
import { RelatedProjects } from "./related-projects"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RelatedEstimates } from "./related-estimates"

// Import dropdown menu components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Import modal components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea" // Assuming Textarea is needed for modal
import { Label } from "@/components/ui/label" // Assuming Label is needed for modal

import { useState, useEffect } from "react" // Import useState and useEffect
import { toast } from "@/components/ui/use-toast" // Import toast
import type { OpportunityWithRelations } from "@/lib/opportunities" // Import OpportunityWithRelations type

export default function OpportunityDetailPage({ params: { id } }: { params: { id: string } }) {
  // State for opportunity data
  const [opportunity, setOpportunity] = useState<OpportunityWithRelations | null>(null);
  // State for AI email draft modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [draftedEmailText, setDraftedEmailText] = useState("");
  const [isDraftingEmail, setIsDraftingEmail] = useState(false);

  // Check if the ID is "new" and redirect to the new opportunity page
  if (id === "new") {
    notFound() // This will trigger the not-found.tsx page
  }

  useEffect(() => {
    const fetchOpportunityData = async () => {
      try {
        const fetchedOpportunity = await opportunityService.getOpportunityById(id);
        if (fetchedOpportunity) {
          setOpportunity(fetchedOpportunity);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching opportunity:", error);
        notFound();
      }
    };
    fetchOpportunityData();
  }, [id]); // Dependency array includes id

  // Show loading state if opportunity data is not yet loaded
  if (!opportunity) {
    return <div>Loading...</div>; // Or a more sophisticated loading spinner
  }


  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status?.toLowerCase()) { // Use optional chaining
        case "new lead":
          return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New Lead</Badge>
        case "contact attempted":
          return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Contact Attempted</Badge>
        case "contacted":
          return <Badge className="bg-green-100 text-green-800 hover:bg-green-800">Contacted</Badge>
        case "needs scheduling":
          return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-800">Needs Scheduling</Badge>
        case "task scheduled":
          return <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-800">Task Scheduled</Badge>
        case "needs estimate":
          return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-800">Needs Estimate</Badge>
        case "estimate sent":
          return <Badge className="bg-cyan-100 text-cyan-800 hover:bg-cyan-800">Estimate Sent</Badge> // Corrected hover color
        case "estimate accepted":
          return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-800">Estimate Accepted</Badge> // Corrected hover color
        case "estimate rejected":
          return <Badge className="bg-red-100 text-red-800 hover:bg-red-800">Estimate Rejected</Badge> // Corrected hover color
        case "on hold":
          return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-800">On Hold</Badge> // Corrected hover color
        case "lost":
          return <Badge className="bg-red-100 text-red-800 hover:bg-red-800">Lost</Badge> // Corrected hover color
        default:
          return <Badge variant="outline">{status}</Badge>
      }
    }

    // Get initials for avatar
    function getInitials(name: string | null | undefined) { // Allow null/undefined
      if (!name) return "";
      return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    }

    // Count items for tab labels
    const appointmentsCount = opportunity.tasks?.length || 0
    const projectsCount = opportunity.projects?.length || 0
    const estimatesCount = opportunity.estimates?.length || 0

    // Handle drafting follow-up email
    const handleDraftFollowUpEmail = async () => {
      setIsDraftingEmail(true);
      setDraftedEmailText(""); // Clear previous draft
      setIsEmailModalOpen(true); // Open modal immediately
    };

    // Handle copying email text to clipboard
    const handleCopyToClipboard = () => {
      navigator.clipboard.writeText(draftedEmailText);
      toast({
        title: "Copied!",
        description: "Email draft copied to clipboard.",
      });
    };


    return (
      <div className="flex flex-col space-y-8">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" asChild className="h-10 w-10">
              <Link href="/opportunities">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{opportunity.opportunity_name}</h1>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusBadge(opportunity.status)}
                <span className="text-sm text-muted-foreground">Created {formatDate(opportunity.created_at)}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">

            {opportunity.status !== "Estimate Accepted" && opportunity.status !== "Lost" && (
              <Button variant="outline" asChild>
                <Link href={`/opportunities/${opportunity.id}/convert`}>Convert to Project</Link>
              </Button>
            )}
            <Button asChild>
              <Link href={`/opportunities/${opportunity.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Opportunity
              </Link>
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    {opportunity.person ? (
                      <Link href={`/people/${opportunity.person.id}`} className="hover:underline">
                        {opportunity.person.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">No contact linked</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                    {opportunity.estimated_value ? (
                      <span>{formatCurrency(opportunity.estimated_value)}</span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Probability</CardTitle>
                </CardHeader>
                <CardContent>
                  {opportunity.probability !== null ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-bold">{opportunity.probability}%</span>
                        {opportunity.estimated_value && (
                          <span className="text-sm text-muted-foreground">
                            Est: {formatCurrency(opportunityService.calculateWeightedValue(opportunity))}
                          </span>
                        )}
                      </div>
                      <Progress value={opportunity.probability} className="h-2" />
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Expected Close</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {opportunity.expected_close_date ? (
                      <span>{formatDate(opportunity.expected_close_date)}</span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks" className="flex items-center justify-center">
                  Tasks
                  {appointmentsCount > 0 && (
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">{appointmentsCount}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="projects" className="flex items-center justify-center">
                  Projects
                  {projectsCount > 0 && (
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">{projectsCount}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="estimates" className="flex items-center justify-center">
                  Estimates
                  {estimatesCount > 0 && (
                    <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">{estimatesCount}</span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Opportunity Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium">Source</h3>
                        <p>{opportunity.source || "Not specified"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Assigned To</h3>
                        <p>{opportunity.assigned_user_id || "Unassigned"}</p>
                      </div>
                    </div>

                    {opportunity.description && (
                      <div>
                        <h3 className="text-sm font-medium">Description</h3>
                        <p className="mt-1">{opportunity.description}</p>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium">Timeline</h3>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="text-xs text-muted-foreground">
                          <p>Created</p>
                          <p>{formatDate(opportunity.created_at)}</p>
                        </div>
                        <div className="h-8 border-l border-muted"></div>
                        <div className="text-xs text-muted-foreground">
                          <p>Last Updated</p>
                          <p>{formatDate(opportunity.updated_at)}</p>
                        </div>
                        {opportunity.expected_close_date && (
                          <>
                            <div className="h-8 border-l border-muted"></div>
                            <div className="text-xs text-muted-foreground">
                              <p>Expected Close</p>
                              <p>{formatDate(opportunity.expected_close_date)}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <History className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No recent activity</h3>
                      <p className="text-muted-foreground mt-2">Activity and updates will be shown here.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader>
                    <CardTitle>Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelatedTasks tasks={opportunity.tasks || []} opportunityId={opportunity.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects">
                <Card>
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelatedProjects projects={opportunity.projects || []} opportunityId={opportunity.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="estimates">
                <Card>
                  <CardHeader>
                    <CardTitle>Estimates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RelatedEstimates estimates={opportunity.estimates || []} opportunityId={opportunity.id} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>Notes</CardTitle>
                      <Button>
                        <MessageSquare className="mr-2 h-4 w-4" /> Add Note
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <MessageSquare className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No notes found</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        No notes have been added to this opportunity yet.
                      </p>
                      <Button>
                        <MessageSquare className="mr-2 h-4 w-4" /> Add a note
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(opportunity.person?.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    {opportunity.person ? (
                      <Link href={`/people/${opportunity.person.id}`} className="font-medium hover:underline">
                        {opportunity.person.name}
                      </Link>
                    ) : (
                      <span className="text-muted-foreground">No contact linked</span>
                    )}
                    <p className="text-sm text-muted-foreground">{opportunity.person?.type}</p>
                  </div>
                </div>

                {opportunity.person?.email && (
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`mailto:${opportunity.person.email}`} className="hover:underline">
                      {opportunity.person.email}
                    </a>
                  </div>
                )}

                {opportunity.person?.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <a href={`tel:${opportunity.person.phone}`} className="hover:underline">
                      {opportunity.person.phone}
                    </a>
                  </div>
                )}

                <div className="flex justify-end">
                  {opportunity.person && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/people/${opportunity.person.id}`}>View Contact</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/tasks/new?opportunityId=${opportunity.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Task
                  </Link>
                </Button>
                <Button className="w-full justify-start" variant="outline" asChild>
                  <Link href={`/estimates/new?opportunityId=${opportunity.id}&personId=${opportunity.person?.id}`}>
                    <FileText className="mr-2 h-4 w-4" />
                    Create AI Estimate
                  </Link>
                </Button>
                {opportunity.status !== "Estimate Accepted" && opportunity.status !== "Lost" && (
                  <Button className="w-full justify-start" variant="outline" asChild>
                    <Link href={`/opportunities/${opportunity.id}/convert`}>
                      <FileText className="mr-2 h-4 w-4" />
                      Convert to Project
                    </Link>
                  </Button>
                )}
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Add Note
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {opportunity.status === "New Lead" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Contact lead</p>
                          <p className="text-sm text-muted-foreground">Reach out to establish initial contact</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-muted"></div>
                        <div>
                          <p className="font-medium">Schedule task</p>
                          <p className="text-sm text-muted-foreground">Set up a meeting to discuss needs</p>
                        </div>
                      </div>
                    </>
                  )}

                  {opportunity.status === "Contact Attempted" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Follow up</p>
                          <p className="text-sm text-muted-foreground">Try contacting again</p>
                        </div>
                      </div>
                    </>
                  )}

                  {opportunity.status === "Needs Scheduling" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Schedule task</p>
                          <p className="text-sm text-muted-foreground">Set up a meeting to discuss needs</p>
                        </div>
                      </div>
                    </>
                  )}

                  {opportunity.status === "Needs Estimate" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Create estimate</p>
                          <p className="text-sm text-muted-foreground">Prepare and send an estimate</p>
                        </div>
                      </div>
                    </>
                  )}

                  {opportunity.status === "Estimate Sent" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Follow up on estimate</p>
                          <p className="text-sm text-muted-foreground">Check if they've reviewed the estimate</p>
                        </div>
                      </div>
                    </>
                  )}

                  {opportunity.status === "Estimate Accepted" && (
                    <>
                      <div className="flex items-start space-x-2">
                        <div className="mt-0.5 h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
                        </div>
                        <div>
                          <p className="font-medium">Convert to project</p>
                          <p className="text-sm text-muted-foreground">Create a project to begin work</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
}
