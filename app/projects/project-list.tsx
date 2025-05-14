import Link from "next/link"
import { projectService } from "@/lib/projects"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default async function ProjectList({
  status,
  search,
  customerId,
}: {
  status?: string
  search?: string
  customerId?: string
}) {
  try {
    const projects = await projectService.getProjects({ status, search, customerId })

    if (projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">No projects found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter to find what you're looking for.
          </p>
        </div>
      )
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                  {project.project_name || "Unnamed Project"}
                </Link>
                <div className="text-sm text-muted-foreground">
                  {project.description?.substring(0, 50)}
                  {project.description && project.description.length > 50 ? "..." : ""}
                </div>
              </TableCell>
              <TableCell>
                {project.customer ? (
                  <Link href={`/people/${project.customer.id}`} className="hover:underline">
                    {project.customer.name}
                  </Link>
                ) : (
                  "No customer"
                )}
              </TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(project.budget_amount || 0)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit project
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}/jobs/new`}>
                        <Eye className="mr-2 h-4 w-4" />
                        Add job
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  } catch (err) {
    // Handle the error without redeclaring the 'error' identifier
    const errorMessage = err instanceof Error ? err.message : "Failed to load projects"
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-red-500 mb-2">Error loading projects</p>
        <p className="text-sm text-muted-foreground">{errorMessage}</p>
      </div>
    )
  }
}

function ProjectStatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Pending Start":
      return <Badge variant="outline">Pending Start</Badge>
    case "Planning":
      return <Badge variant="secondary">Planning</Badge>
    case "In Progress":
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
    case "On Hold":
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">On Hold</Badge>
    case "Awaiting Change Order Approval":
      return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Awaiting Approval</Badge>
    case "Nearing Completion":
      return <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-100">Nearing Completion</Badge>
    case "Completed":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case "Canceled":
      return <Badge variant="destructive">Canceled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}
