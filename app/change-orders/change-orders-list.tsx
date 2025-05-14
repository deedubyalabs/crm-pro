"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Plus } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { ChangeOrderStatus } from "@/lib/change-orders"

interface ChangeOrdersListProps {
  changeOrders: any[]
}

export default function ChangeOrdersList({ changeOrders }: ChangeOrdersListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")

  const filteredChangeOrders = changeOrders.filter((changeOrder) => {
    const searchString = searchTerm.toLowerCase()
    return (
      changeOrder.co_number?.toLowerCase().includes(searchString) ||
      changeOrder.description?.toLowerCase().includes(searchString) ||
      changeOrder.project?.project_name?.toLowerCase().includes(searchString)
    )
  })

  const getStatusBadgeColor = (status: ChangeOrderStatus) => {
    switch (status) {
      case "Requested":
        return "bg-blue-100 text-blue-800"
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Approved":
        return "bg-green-100 text-green-800"
      case "Rejected":
        return "bg-red-100 text-red-800"
      case "Completed":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="w-1/3">
          <Input
            placeholder="Search change orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => router.push("/change-orders/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Change Order
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Number</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Cost Impact</TableHead>
              <TableHead>Time Impact</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredChangeOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No change orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredChangeOrders.map((changeOrder) => (
                <TableRow key={changeOrder.id}>
                  <TableCell className="font-medium">
                    <Link href={`/change-orders/${changeOrder.id}`} className="text-blue-600 hover:underline">
                      {changeOrder.co_number || "Draft"}
                    </Link>
                  </TableCell>
                  <TableCell>{changeOrder.project?.project_name || "Unknown Project"}</TableCell>
                  <TableCell className="max-w-xs truncate">{changeOrder.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusBadgeColor(changeOrder.status)}>
                      {changeOrder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(changeOrder.cost_impact)}</TableCell>
                  <TableCell>{changeOrder.time_impact_days || 0} days</TableCell>
                  <TableCell>{formatDate(changeOrder.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/change-orders/${changeOrder.id}`)}>
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/change-orders/${changeOrder.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
