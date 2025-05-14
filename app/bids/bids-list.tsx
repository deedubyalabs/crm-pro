"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import type { BidStatus } from "@/types/bidding"
import type { BidRequest } from "@/types/bidding"

interface BidRequestsListProps {
  bidRequests: BidRequest[]
}

export function BidRequestsList({ bidRequests }: BidRequestsListProps) {
  const [statusFilter, setStatusFilter] = useState<BidStatus | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter bid requests based on status and search query
  const filteredBidRequests = bidRequests.filter((bid) => {
    const matchesStatus = statusFilter === "all" || bid.status === statusFilter
    const matchesSearch = searchQuery === "" || bid.title.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesStatus && matchesSearch
  })

  // Get status badge
  const getStatusBadge = (status: BidStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Sent</Badge>
      case "viewed":
        return <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Viewed</Badge>
      case "responded":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Responded</Badge>
      case "awarded":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Awarded</Badge>
      case "declined":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Declined</Badge>
      case "expired":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Expired</Badge>
      case "cancelled":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BidStatus | "all")}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="viewed">Viewed</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="awarded">Awarded</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Search</label>
              <Input
                placeholder="Search by title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Trade</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBidRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No bid requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredBidRequests.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell className="font-medium">
                      <Link href={`/bids/${bid.id}`} className="hover:underline">
                        {bid.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {bid.trade_category
                        ? bid.trade_category.charAt(0).toUpperCase() + bid.trade_category.slice(1)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {bid.estimate_id ? (
                        <Link href={`/estimates/${bid.estimate_id}`} className="hover:underline">
                          Estimate
                        </Link>
                      ) : bid.change_order_id ? (
                        <Link href={`/change-orders/${bid.change_order_id}`} className="hover:underline">
                          Change Order
                        </Link>
                      ) : (
                        "Manual"
                      )}
                    </TableCell>
                    <TableCell>{bid.due_date ? formatDate(bid.due_date) : "-"}</TableCell>
                    <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    <TableCell>{formatDate(bid.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/bids/${bid.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
