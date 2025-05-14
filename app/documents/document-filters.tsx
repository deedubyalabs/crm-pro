"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

export function DocumentFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [documentType, setDocumentType] = useState<string>(searchParams.get("documentType") || "")
  const [status, setStatus] = useState<string>(searchParams.get("status") || "")
  const [search, setSearch] = useState<string>(searchParams.get("search") || "")

  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()

    if (documentType) params.set("documentType", documentType)
    if (status) params.set("status", status)
    if (search) params.set("search", search)

    const url = `/documents${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url)
  }, [documentType, status, search, router])

  // Reset all filters
  const resetFilters = () => {
    setDocumentType("")
    setStatus("")
    setSearch("")
  }

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-end md:space-x-4 md:space-y-0">
      <div className="grid gap-2">
        <Select value={documentType} onValueChange={setDocumentType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Document Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="estimate">Estimate</SelectItem>
            <SelectItem value="invoice">Invoice</SelectItem>
            <SelectItem value="permit">Permit</SelectItem>
            <SelectItem value="plan">Plan</SelectItem>
            <SelectItem value="photo">Photo</SelectItem>
            <SelectItem value="warranty">Warranty</SelectItem>
            <SelectItem value="certificate">Certificate</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 grid gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {(documentType || status || search) && (
        <Button variant="ghost" onClick={resetFilters} className="h-10 px-3 lg:px-2">
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
