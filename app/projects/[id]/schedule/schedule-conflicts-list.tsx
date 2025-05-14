"use client"

import { Button } from "@/components/ui/button"
import type { SchedulingConflict, ProjectTaskWithDetails } from "@/types/scheduler"
import { AlertTriangle, CheckCircle } from "lucide-react"

interface ScheduleConflictsListProps {
  conflicts: SchedulingConflict[]
  tasks: ProjectTaskWithDetails[]
}

export default function ScheduleConflictsList({ conflicts, tasks }: ScheduleConflictsListProps) {
  // Function to get task name by ID
  const getTaskName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return task ? task.name : "Unknown Task"
  }

  // Group conflicts by type
  const conflictsByType: Record<string, SchedulingConflict[]> = {}

  conflicts.forEach((conflict) => {
    if (!conflictsByType[conflict.conflict_type]) {
      conflictsByType[conflict.conflict_type] = []
    }
    conflictsByType[conflict.conflict_type].push(conflict)
  })

  // Get friendly type name
  const getConflictTypeName = (type: string) => {
    switch (type) {
      case "resource_overallocation":
        return "Resource Overallocation"
      case "dependency_violation":
        return "Dependency Violation"
      case "constraint_violation":
        return "Constraint Violation"
      case "weather_impact":
        return "Weather Impact"
      default:
        return type
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
    }
  }

  return (
    <div className="space-y-4">
      {Object.entries(conflictsByType).map(([type, typeConflicts]) => (
        <div key={type} className="space-y-2">
          <h3 className="font-medium">
            {getConflictTypeName(type)} ({typeConflicts.length})
          </h3>
          <ul className="space-y-2">
            {typeConflicts.map((conflict) => (
              <li key={conflict.id} className="flex items-start gap-2 p-2 rounded-md bg-amber-100">
                <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-grow">
                  <p>{conflict.description}</p>
                  {conflict.affected_tasks && conflict.affected_tasks.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Affected tasks: {conflict.affected_tasks.map((id) => getTaskName(id)).join(", ")}
                    </p>
                  )}
                  {conflict.resolution_status !== "unresolved" && (
                    <div className="flex items-center mt-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span>
                        {conflict.resolution_status === "auto_resolved"
                          ? "Automatically resolved"
                          : conflict.resolution_status === "manually_resolved"
                            ? "Manually resolved"
                            : "Ignored"}
                        {conflict.resolution_description ? `: ${conflict.resolution_description}` : ""}
                      </span>
                    </div>
                  )}
                </div>
                {conflict.resolution_status === "unresolved" && (
                  <Button size="sm" variant="outline" className="flex-shrink-0">
                    Resolve
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {conflicts.length === 0 && (
        <div className="text-center py-4 text-muted-foreground">No scheduling conflicts detected</div>
      )}
    </div>
  )
}
