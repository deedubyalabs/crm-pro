"use client"

import { useRouter, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface OpportunityStatusFilterProps {
  activeStatus?: string
}

export default function OpportunityStatusFilter({ activeStatus }: OpportunityStatusFilterProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handleStatusChange = (value: string) => {
    // Create a new URLSearchParams object
    const searchParams = new URLSearchParams(window.location.search)

    // Update or remove the status parameter
    if (value === "all") {
      searchParams.delete("status")
    } else {
      searchParams.set("status", value)
    }

    // Navigate to the new URL
    router.push(`${pathname}?${searchParams.toString()}`)
  }

  return (
    <Tabs defaultValue={activeStatus || "all"} onValueChange={handleStatusChange} className="w-full">
      <TabsList className="grid grid-cols-6 w-full max-w-3xl">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="New Lead">New</TabsTrigger>
        <TabsTrigger value="Needs Estimate">Qualified</TabsTrigger>
        <TabsTrigger value="Estimate Sent">Proposal</TabsTrigger>
        <TabsTrigger value="Estimate Accepted">Negotiation</TabsTrigger>
        <TabsTrigger value="Lost">Closed</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
