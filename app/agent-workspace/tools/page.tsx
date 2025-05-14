import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Wrench, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

// Sample tools data
const tools = [
  {
    id: "tool-1",
    name: "createAppointment",
    description: "Schedule a new appointment",
    endpoint: "POST /api/v1/appointments",
    status: "enabled",
    agentsWithAccess: 3,
    usageCount: 46,
  },
  {
    id: "tool-2",
    name: "getProjectDetails",
    description: "Retrieve project information",
    endpoint: "GET /api/v1/projects/{projectId}",
    status: "enabled",
    agentsWithAccess: 5,
    usageCount: 124,
  },
  {
    id: "tool-3",
    name: "updateProjectStatus",
    description: "Update the status of a project",
    endpoint: "PATCH /api/v1/projects/{projectId}",
    status: "enabled",
    agentsWithAccess: 2,
    usageCount: 68,
  },
  {
    id: "tool-4",
    name: "createInvoice",
    description: "Generate a new invoice",
    endpoint: "POST /api/v1/invoices",
    status: "enabled",
    agentsWithAccess: 1,
    usageCount: 112,
  },
  {
    id: "tool-5",
    name: "searchPeople",
    description: "Search for people by criteria",
    endpoint: "GET /api/v1/people",
    status: "enabled",
    agentsWithAccess: 4,
    usageCount: 215,
  },
  {
    id: "tool-6",
    name: "createEstimate",
    description: "Create a new estimate",
    endpoint: "POST /api/v1/estimates",
    status: "disabled",
    agentsWithAccess: 0,
    usageCount: 0,
  },
]

export default function ToolsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tools</h1>
          <p className="text-muted-foreground">Manage API endpoints and functions available to agents</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tool Management</CardTitle>
              <CardDescription>View and manage available tools for agents</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search tools..." className="pl-8 w-[250px]" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Agents with Access</TableHead>
                <TableHead>Usage Count</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{tool.name}</div>
                        <div className="text-sm text-muted-foreground">{tool.description}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="bg-slate-100 px-1 py-0.5 rounded text-sm">{tool.endpoint}</code>
                  </TableCell>
                  <TableCell>
                    {tool.status === "enabled" ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Enabled</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell>{tool.agentsWithAccess}</TableCell>
                  <TableCell>{tool.usageCount}</TableCell>
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
                          <Link href={`/agent-workspace/tools/${tool.id}`}>View Details</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Schema
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tool.status === "enabled" ? (
                          <DropdownMenuItem>Disable</DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem>Enable</DropdownMenuItem>
                        )}
                        <DropdownMenuItem>Manage Access</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
