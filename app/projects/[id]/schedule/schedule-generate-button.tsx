"use client"

import { useState } from "react"
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
import { useAIContext } from "@/contexts/ai-context"
import ClientOnly from "@/components/ClientOnly"

interface ScheduleGenerateButtonProps {
  projectId: string
  projectName: string // Added projectName prop
  hasExistingJobs: boolean
  size?: "default" | "sm" | "lg"
}

export default function ScheduleGenerateButton({
  projectId,
  projectName,
  hasExistingJobs,
  size = "default",
}: ScheduleGenerateButtonProps) {
  const { setAssistantOpen, setContext } = useAIContext()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [useTemplates, setUseTemplates] = useState(true)
  const [includeWeather, setIncludeWeather] = useState(true)

  const handleGenerateScheduleWithAI = () => {
    setIsLoading(true)
    // Set context for AI assistant and open the drawer with an initial message
    setContext("project", projectId, `Let's build the schedule for project @${projectName}.`)
    setAssistantOpen(true)
    setOpen(false) // Close the dialog
    setIsLoading(false)
  }

  return (
    <ClientOnly>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size={size}>{hasExistingJobs ? "Regenerate Schedule" : "Generate Schedule with Pro-pilot"}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Generate Project Schedule with Pro-pilot</DialogTitle>
            <DialogDescription>
              Initiate a conversation with Pro-pilot to collaboratively build or refine your project schedule.
              {hasExistingJobs && " This will allow you to modify the existing schedule."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Pro-pilot will guide you through defining tasks, durations, and dependencies.
              You can specify a desired start date, and whether to use templates or consider weather impacts during the conversation.
            </p>
            {/* The following inputs are now illustrative, as Pro-pilot will handle these conversationally */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Suggested Start Date (for Pro-pilot)</label>
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
                Suggest using task templates
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
                Suggest including weather data
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateScheduleWithAI} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientOnly>
  )
}
