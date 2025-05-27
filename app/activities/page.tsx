"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ActivityList } from "./components/activity-list"
import { AddEditActivityDrawer } from "./components/add-edit-activity-drawer"

export default function ActivitiesPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)

  const handleNewActivity = () => {
    setSelectedActivityId(null)
    setIsDrawerOpen(true)
  }

  const handleEditActivity = (activityId: string) => {
    setSelectedActivityId(activityId)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedActivityId(null)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold">Activities</h1>
        <Button onClick={handleNewActivity}>
          <Plus className="mr-2 h-4 w-4" /> New Activity
        </Button>
      </div>
      <Separator />
      <div className="p-4 flex-grow">
        {/* Filtering and Sorting Placeholder */}
        <div className="mb-4">
          {/* Filters and Sort controls will go here */}
          <p>Filters and sorting options will be implemented here.</p>
        </div>

        {/* Activity List */}
        <ActivityList onEditActivity={handleEditActivity} />
      </div>

      <AddEditActivityDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        activityId={selectedActivityId}
      />
    </div>
  )
}
