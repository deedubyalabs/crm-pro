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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Clock } from "lucide-react"

interface JobTimeLoggerProps {
  jobId: string
}

export default function JobTimeLogger({ jobId }: JobTimeLoggerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [hours, setHours] = useState("")
  const [notes, setNotes] = useState("")
  const [open, setOpen] = useState(false)

  async function logTime() {
    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      toast({
        title: "Invalid hours",
        description: "Please enter a valid number of hours",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/jobs/${jobId}/time`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hours: Number(hours),
          notes: notes.trim() || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to log time")
      }

      toast({
        title: "Time logged",
        description: `Successfully logged ${hours} hours for this job`,
      })

      setHours("")
      setNotes("")
      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to log time",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Clock className="mr-2 h-4 w-4" />
          Log Time
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Time</DialogTitle>
          <DialogDescription>Record the time you've spent working on this job.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="hours" className="text-right">
              Hours
            </Label>
            <Input
              id="hours"
              type="number"
              step="0.25"
              min="0.25"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="col-span-3"
              placeholder="Enter hours worked"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="Add notes about the work done (optional)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={logTime} disabled={isLoading}>
            {isLoading ? "Logging..." : "Log Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
