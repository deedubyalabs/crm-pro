import Link from "next/link"
import type { MaterialList } from "@/types/material-lists"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { FileText, ShoppingCart, ExternalLink } from "lucide-react"

interface MaterialListsTableProps {
  materialLists: MaterialList[]
}

export default function MaterialListsTable({ materialLists }: MaterialListsTableProps) {
  // Helper function to get status badge
  function getStatusBadge(status: string) {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "finalized":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Finalized</Badge>
      case "ordered":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Ordered</Badge>
      case "partial":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Partial</Badge>
      case "complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>All Material Lists</CardTitle>
        <CardDescription>View and manage material lists for your projects</CardDescription>
      </CardHeader>
      <CardContent>
        {materialLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No material lists found</h3>
            <p className="text-muted-foreground mt-2 mb-6">Get started by creating your first material list.</p>
            <Button asChild>
              <Link href="/material-lists/new">Create Material List</Link>
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialLists.map((list) => (
                <TableRow key={list.id}>
                  <TableCell className="font-medium">
                    <Link href={`/material-lists/${list.id}`} className="hover:underline">
                      {list.name}
                    </Link>
                    {list.estimate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        From Estimate: {list.estimate.estimate_number}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {list.project ? (
                      <Link href={`/projects/${list.project.id}`} className="hover:underline flex items-center">
                        {list.project.project_name}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Link>
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(list.status)}</TableCell>
                  <TableCell>{formatDate(list.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/material-lists/${list.id}`}>
                          <FileText className="mr-2 h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      {(list.status === "draft" || list.status === "finalized") && (
                        <Button asChild size="sm">
                          <Link href={`/material-lists/${list.id}/purchase-orders/new`}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Create PO
                          </Link>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
