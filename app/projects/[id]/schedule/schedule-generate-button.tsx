"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ScheduleGenerateButtonProps {
  projectId: string
  hasExistingTasks: boolean
  size?: "default" | "sm" | "lg"
}

export default function ScheduleGenerateButton({
  projectId,
  hasExistingTasks,
  size = "default",
}: ScheduleGenerateButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [useTemplates, setUseTemplates] = useState(true)
  const [includeWeather, setIncludeWeather] = useState(true)

  const handleGenerateSchedule = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/schedule/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: startDate?.toISOString(),
          useTemplates,
          includeWeather,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate schedule")
      }

      toast({
        title: "Schedule generated",
        description: "Project schedule has been successfully generated.",
      })

      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error("Error generating schedule:", error)
      toast({
        title: "Error",
        description: "Failed to generate schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size}>{hasExistingTasks ? "Regenerate Schedule" : "Generate Schedule"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Project Schedule</DialogTitle>
          <DialogDescription>
            Create a new schedule for your project based on tasks and dependencies.
            {hasExistingTasks && " This will replace the existing schedule."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Start Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="useTemplates"
              checked={useTemplates}
              onCheckedChange={(checked) => setUseTemplates(checked as boolean)}
            />
            <label
              htmlFor="useTemplates"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Use task templates
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="includeWeather"
              checked={includeWeather}
              onCheckedChange={(checked) => setIncludeWeather(checked as boolean)}
            />
            <label
              htmlFor="includeWeather"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Include weather data
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateSchedule} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
