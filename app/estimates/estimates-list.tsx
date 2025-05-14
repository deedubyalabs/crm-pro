"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"
import type { Estimate } from "@/types/estimates"
import { formatCurrency, formatDate } from "@/lib/utils"

export function EstimatesList({ estimates }: { estimates: Estimate[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")

  // Get current filter values from URL
  const currentStatus = searchParams.get("status") || ""

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (searchTerm) {
      params.set("search", searchTerm)
    } else {
      params.delete("search")
    }

    router.push(`/estimates?${params.toString()}`)
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    router.push(`/estimates?${params.toString()}`)
  }

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 hover:bg-gray-50">
            Draft
          </Badge>
        )
      case "Sent":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-50">
            Sent
          </Badge>
        )
      case "Accepted":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
            Accepted
          </Badge>
        )
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">
            Rejected
          </Badge>
        )
      case "Expired":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-50">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Estimates</h1>
          <p className="text-muted-foreground">Create and manage estimates for your opportunities</p>
        </div>
        <Button asChild>
          <Link href="/estimates/new">
            <Plus className="mr-2 h-4 w-4" /> Create Estimate
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Estimates</CardTitle>
          <CardDescription>View and manage all your estimates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search estimates..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </form>

            <div className="flex flex-wrap gap-2">
              <Select value={currentStatus} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estimate #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No estimates found.
                    </TableCell>
                  </TableRow>
                ) : (
                  estimates.map((estimate) => {
                    // Format the person name
                    const personName =
                      estimate.person.business_name ||
                      `${estimate.person.first_name || ""} ${estimate.person.last_name || ""}`.trim()

                    return (
                      <TableRow key={estimate.id}>
                        <TableCell className="font-medium">{estimate.estimate_number || "Draft"}</TableCell>
                        <TableCell>
                          <Link href={`/people/${estimate.person_id}`} className="hover:underline">
                            {personName}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link href={`/opportunities/${estimate.opportunity_id}`} className="hover:underline">
                            {estimate.opportunity.opportunity_name}
                          </Link>
                        </TableCell>
                        <TableCell>{estimate.issue_date ? formatDate(estimate.issue_date) : "Not issued"}</TableCell>
                        <TableCell>{estimate.expiration_date ? formatDate(estimate.expiration_date) : "N/A"}</TableCell>
                        <TableCell>{getStatusBadge(estimate.status)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(estimate.total_amount)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/estimates/${estimate.id}`}>View</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/estimates/${estimate.id}/edit`}>Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
