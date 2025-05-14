"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProjectTaskWithDetails } from "@/types/scheduler"

interface ResourceAllocationChartProps {
  tasks: ProjectTaskWithDetails[]
}

export default function ResourceAllocationChart({ tasks }: ResourceAllocationChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <ResourceChartSkeleton />
  }

  // Extract resource assignments from tasks
  const resourceAssignments: Record<
    string,
    {
      name: string
      assignments: {
        taskId: string
        taskName: string
        start: Date
        end: Date
      }[]
    }
  > = {}

  tasks.forEach((task) => {
    if (task.resourceAssignments && task.scheduled_start && task.scheduled_end) {
      task.resourceAssignments.forEach((assignment) => {
        if (!assignment.resource) return

        const resourceId = assignment.resource_id
        const resourceName = assignment.resource.name || "Unknown Resource"

        if (!resourceAssignments[resourceId]) {
          resourceAssignments[resourceId] = {
            name: resourceName,
            assignments: [],
          }
        }

        resourceAssignments[resourceId].assignments.push({
          taskId: task.id,
          taskName: task.name,
          start: new Date(task.scheduled_start!),
          end: new Date(task.scheduled_end!),
        })
      })
    }
  })

  // Calculate utilization for each resource
  const resourceUtilization = Object.entries(resourceAssignments).map(([resourceId, resource]) => {
    // Find project duration
    let projectStart = new Date()
    let projectEnd = new Date()
    projectEnd.setMonth(projectEnd.getMonth() + 1) // Default to 1 month from now

    tasks.forEach((task) => {
      if (task.scheduled_start && new Date(task.scheduled_start) < projectStart) {
        projectStart = new Date(task.scheduled_start)
      }
      if (task.scheduled_end && new Date(task.scheduled_end) > projectEnd) {
        projectEnd = new Date(task.scheduled_end)
      }
    })

    const projectDuration = (projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24)

    // Calculate total assigned days
    let assignedDays = 0
    resource.assignments.forEach((assignment) => {
      const duration = (assignment.end.getTime() - assignment.start.getTime()) / (1000 * 60 * 60 * 24)
      assignedDays += duration
    })

    // Calculate utilization percentage
    const utilization = (assignedDays / projectDuration) * 100

    return {
      resourceId,
      name: resource.name,
      utilization: Math.min(utilization, 100), // Cap at 100%
      assignmentCount: resource.assignments.length,
    }
  })

  // Sort by utilization (highest first)
  resourceUtilization.sort((a, b) => b.utilization - a.utilization)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resourceUtilization.map((resource) => (
              <div key={resource.resourceId} className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{resource.name}</span>
                  <span className="text-sm">{resource.utilization.toFixed(0)}% utilized</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${getUtilizationColor(resource.utilization)}`}
                    style={{ width: `${resource.utilization}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {resource.assignmentCount} task{resource.assignmentCount !== 1 ? "s" : ""} assigned
                </div>
              </div>
            ))}

            {resourceUtilization.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">No resource assignments found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Resource timeline visualization will be implemented in a future update
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getUtilizationColor(utilization: number): string {
  if (utilization > 90) return "bg-red-500"
  if (utilization > 75) return "bg-amber-500"
  if (utilization > 50) return "bg-green-500"
  return "bg-blue-500"
}

function ResourceChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2.5 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
