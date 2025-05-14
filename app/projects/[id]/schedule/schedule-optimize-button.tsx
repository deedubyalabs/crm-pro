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
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface ScheduleOptimizeButtonProps {
  projectId: string
}

export default function ScheduleOptimizeButton({ projectId }: ScheduleOptimizeButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [options, setOptions] = useState({
    prioritizeByDeadline: true,
    prioritizeByDependencies: true,
    prioritizeByResourceAvailability: true,
    considerWeather: true,
    balanceResourceLoad: true,
    minimizeProjectDuration: true,
    respectConstraints: true,
    allowPartialAssignments: false,
  })

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }))
  }

  const handleOptimizeSchedule = async () => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${projectId}/schedule/optimize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error("Failed to optimize schedule")
      }

      toast({
        title: "Schedule optimized",
        description: "Project schedule has been successfully optimized.",
      })

      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error("Error optimizing schedule:", error)
      toast({
        title: "Error",
        description: "Failed to optimize schedule. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" />
          Optimize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Optimize Project Schedule</DialogTitle>
          <DialogDescription>
            Fine-tune your project schedule to resolve conflicts and improve efficiency.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Optimization Options</h4>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritizeByDeadline"
                  checked={options.prioritizeByDeadline}
                  onCheckedChange={() => handleOptionChange("prioritizeByDeadline")}
                />
                <label
                  htmlFor="prioritizeByDeadline"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Prioritize by deadline
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritizeByDependencies"
                  checked={options.prioritizeByDependencies}
                  onCheckedChange={() => handleOptionChange("prioritizeByDependencies")}
                />
                <label
                  htmlFor="prioritizeByDependencies"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Prioritize by dependencies
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="prioritizeByResourceAvailability"
                  checked={options.prioritizeByResourceAvailability}
                  onCheckedChange={() => handleOptionChange("prioritizeByResourceAvailability")}
                />
                <label
                  htmlFor="prioritizeByResourceAvailability"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Prioritize by resource availability
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="considerWeather"
                  checked={options.considerWeather}
                  onCheckedChange={() => handleOptionChange("considerWeather")}
                />
                <label
                  htmlFor="considerWeather"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Consider weather impacts
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="balanceResourceLoad"
                  checked={options.balanceResourceLoad}
                  onCheckedChange={() => handleOptionChange("balanceResourceLoad")}
                />
                <label
                  htmlFor="balanceResourceLoad"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Balance resource load
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="minimizeProjectDuration"
                  checked={options.minimizeProjectDuration}
                  onCheckedChange={() => handleOptionChange("minimizeProjectDuration")}
                />
                <label
                  htmlFor="minimizeProjectDuration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Minimize project duration
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="respectConstraints"
                  checked={options.respectConstraints}
                  onCheckedChange={() => handleOptionChange("respectConstraints")}
                />
                <label
                  htmlFor="respectConstraints"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Respect scheduling constraints
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowPartialAssignments"
                  checked={options.allowPartialAssignments}
                  onCheckedChange={() => handleOptionChange("allowPartialAssignments")}
                />
                <label
                  htmlFor="allowPartialAssignments"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Allow partial resource assignments
                </label>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleOptimizeSchedule} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Optimize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
