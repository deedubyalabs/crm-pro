"use client"

import { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import type { ProjectTaskWithDetails } from "@/types/scheduler"
import { formatDate } from "@/lib/utils"

interface ProjectScheduleGanttProps {
  tasks: ProjectTaskWithDetails[]
}

export default function ProjectScheduleGantt({ tasks }: ProjectScheduleGanttProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <GanttSkeleton />
  }

  // Find project start and end dates
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

  // Calculate total project duration in days
  const projectDuration = Math.ceil((projectEnd.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))

  // Generate date headers
  const dateHeaders = []
  const currentDate = new Date(projectStart)
  for (let i = 0; i <= projectDuration; i++) {
    dateHeaders.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.scheduled_start) return 1
    if (!b.scheduled_start) return -1
    return new Date(a.scheduled_start).getTime() - new Date(b.scheduled_start).getTime()
  })

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Date headers */}
        <div className="flex border-b">
          <div className="w-48 flex-shrink-0 p-2 font-medium">Task</div>
          <div className="flex-grow flex">
            {dateHeaders.map((date, index) => (
              <div
                key={index}
                className={`flex-shrink-0 w-8 text-xs text-center ${
                  date.getDate() === 1 || index === 0 ? "font-bold" : ""
                } ${date.getDay() === 0 || date.getDay() === 6 ? "bg-gray-50" : ""}`}
              >
                {date.getDate() === 1 || index === 0 ? (
                  <div className="pb-1">{date.toLocaleDateString(undefined, { month: "short" })}</div>
                ) : null}
                <div>{date.getDate()}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        {sortedTasks.map((task) => {
          if (!task.scheduled_start || !task.scheduled_end) return null

          const taskStart = new Date(task.scheduled_start)
          const taskEnd = new Date(task.scheduled_end)

          // Calculate position and width
          const startDays = Math.floor((taskStart.getTime() - projectStart.getTime()) / (1000 * 60 * 60 * 24))
          const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))

          // Determine bar color based on status
          let barColor = "bg-blue-500"
          switch (task.status) {
            case "completed":
              barColor = "bg-green-500"
              break
            case "in_progress":
              barColor = "bg-blue-500"
              break
            case "not_started":
              barColor = "bg-gray-400"
              break
            case "delayed":
              barColor = "bg-amber-500"
              break
            case "cancelled":
              barColor = "bg-red-500"
              break
          }

          return (
            <div key={task.id} className="flex border-b hover:bg-gray-50">
              <div className="w-48 flex-shrink-0 p-2 truncate" title={task.name}>
                {task.name}
              </div>
              <div className="flex-grow flex relative h-10">
                <div
                  className={`absolute h-6 rounded-sm top-2 ${barColor}`}
                  style={{
                    left: `${startDays * 2}rem`,
                    width: `${duration * 2}rem`,
                  }}
                  title={`${task.name}: ${formatDate(task.scheduled_start)} - ${formatDate(task.scheduled_end)}`}
                >
                  <div className="px-2 text-xs text-white truncate h-full flex items-center">
                    {duration > 3 ? task.name : ""}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GanttSkeleton() {
  return (
    <div className="space-y-2">
      <div className="flex border-b">
        <div className="w-48 flex-shrink-0 p-2">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex-grow">
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex border-b">
          <div className="w-48 flex-shrink-0 p-2">
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex-grow">
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
