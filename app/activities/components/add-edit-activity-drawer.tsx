"use client"

import React from "react"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"

interface AddEditActivityDrawerProps {
  isOpen: boolean
  onClose: () => void
  activityId: string | null
}

export function AddEditActivityDrawer({
  isOpen,
  onClose,
  activityId,
}: AddEditActivityDrawerProps) {
  const isEditing = !!activityId

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="fixed bottom-0 left-0 right-0 h-3/4">
        <DrawerHeader>
          <DrawerTitle>{isEditing ? "Edit Activity" : "Add New Activity"}</DrawerTitle>
          <DrawerDescription>
            {isEditing ? `Editing activity ID: ${activityId}` : "Create a new activity."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-4 overflow-auto">
          {/* Form fields will go here */}
          <p>Activity form fields will be implemented here.</p>
          <p>Subject, Description, Status, Due Date, etc.</p>
          <p>Checklist items and attendees will also be managed here.</p>
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => alert("Save functionality to be implemented")}>
            {isEditing ? "Save Changes" : "Create Activity"}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
