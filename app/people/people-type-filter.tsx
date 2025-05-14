"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PeopleTypeFilter({ className }: { className?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get("type") || "all"

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete(name)
    } else {
      params.set(name, value)
    }
    return params.toString()
  }

  const handleTypeChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("type", value)}`)
  }

  return (
    <Tabs defaultValue={currentType} className={className} onValueChange={handleTypeChange}>
      <TabsList className="grid grid-cols-5 w-full">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="customer">Customers</TabsTrigger>
        <TabsTrigger value="lead">Leads</TabsTrigger>
        <TabsTrigger value="business">Businesses</TabsTrigger>
        <TabsTrigger value="subcontractor">Subcontractors</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
