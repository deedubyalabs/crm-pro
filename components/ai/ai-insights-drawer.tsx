"use client"

import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

interface AIInsightsDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectId?: string // Optional, for context if needed
  jobId?: string // Optional, for context if needed
}

export function AIInsightsDrawer({ isOpen, onClose, projectId, jobId }: AIInsightsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>AI Insights & Suggestions</SheetTitle>
          <SheetDescription>
            Proactive AI insights and suggestions for this project will appear here.
            {projectId && <p className="text-sm text-muted-foreground mt-2">Context: Project ID - {projectId}</p>}
            {jobId && <p className="text-sm text-muted-foreground mt-2">Context: Job ID - {jobId}</p>}
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {/* Placeholder content */}
            <p className="text-sm text-muted-foreground">
              This panel will display intelligent insights from Pro-pilot related to the current project or job.
              Examples include:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Schedule monitoring: "Task 'Rough Plumbing' is due soon, but prerequisite 'Framing Inspection' is not yet complete."</li>
              <li>Budget monitoring: "Expenses for 'Lumber' have exceeded the estimated budget by 15%."</li>
              <li>Document/Information gaps: "No permit document uploaded for this project."</li>
              <li>Task prioritization: "You have 3 high-priority jobs due today. Suggest focusing on 'Job A' first."</li>
              <li>Upsell opportunities: "Client mentioned wanting under-cabinet lighting during consultation. Suggest discussing this as an add-on?"</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
              The actual logic for Pro-pilot to generate and send these insights will be a future task.
            </p>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
