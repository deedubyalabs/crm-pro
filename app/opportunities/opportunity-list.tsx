import { opportunityService } from "@/lib/opportunities"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MoreHorizontal, Calendar, DollarSign, User, BarChart, Percent } from "lucide-react" // Import Percent icon
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Helper function to get status badge
function getStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "new":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">New</Badge>
    case "qualified":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Qualified</Badge>
    case "proposal":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Proposal</Badge>
    case "negotiation":
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Negotiation</Badge>
    case "closed-won":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Closed Won</Badge>
    case "closed-lost":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Closed Lost</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

import { OpportunityStatus } from "@/lib/opportunities"; // Import OpportunityStatus type

export default async function OpportunityList({
  status,
  search,
  personId,
}: {
  status?: OpportunityStatus | "all";
  search?: string;
  personId?: string;
}) {
  const opportunities = await opportunityService.getOpportunities({ status, search, personId });

  if (opportunities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <BarChart className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No opportunities found</h3>
        <p className="text-muted-foreground mt-2 mb-6 max-w-md">
          {search
            ? `No opportunities match your search "${search}"`
            : status
              ? `No ${status} opportunities found`
              : "Get started by creating your first opportunity"}
        </p>
        <Button asChild>
          <Link href="/opportunities/new">Create a new opportunity</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Estimated Value</TableHead> {/* Changed from Value */}
            <TableHead>Probability</TableHead> {/* Added Probability */}
            <TableHead>Lead Score</TableHead> {/* Added Lead Score */}
            <TableHead>Expected Close Date</TableHead> {/* Changed from Completion Date */}
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {opportunities.map((opportunity) => (
            <TableRow key={opportunity.id}>
              <TableCell>
                <Link href={`/opportunities/${opportunity.id}`} className="font-medium hover:underline">
                  {opportunity.opportunity_name || "Untitled Opportunity"} {/* Corrected from title */}
                </Link>
                {opportunity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">{opportunity.description}</p>
                )}
              </TableCell>
              <TableCell>{getStatusBadge(opportunity.status)}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Link href={`/people/${opportunity.person.id}`} className="hover:underline">
                    {opportunity.person.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell>
                {opportunity.estimated_value ? (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    {formatCurrency(opportunity.estimated_value)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {opportunity.probability !== null && opportunity.probability !== undefined ? (
                  <div className="flex items-center">
                    <Percent className="h-4 w-4 mr-1 text-muted-foreground" />
                    {opportunity.probability}%
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {opportunity.lead_score !== null && opportunity.lead_score !== undefined ? (
                  <div className="flex items-center">
                    <BarChart className="h-4 w-4 mr-1 text-muted-foreground" />
                    {opportunity.lead_score}%
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                {opportunity.expected_close_date ? (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    {formatDate(opportunity.expected_close_date)}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Not set</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${opportunity.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${opportunity.id}/edit`}>Edit Opportunity</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/opportunities/${opportunity.id}/convert`}>Convert to Project</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/estimates/new?opportunityId=${opportunity.id}`}>Create Estimate</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete Opportunity</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
