"use client"

import { useRouter, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface TaskStatusFilterProps {
  activeStatus?: string
}

export default function TaskStatusFilter({ activeStatus }: TaskStatusFilterProps) {
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
      <TabsList className="grid grid-cols-5 w-full max-w-2xl">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="Scheduled">Scheduled</TabsTrigger>
        <TabsTrigger value="Completed">Completed</TabsTrigger>
        <TabsTrigger value="Canceled">Canceled</TabsTrigger>
        <TabsTrigger value="Rescheduled">Rescheduled</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
