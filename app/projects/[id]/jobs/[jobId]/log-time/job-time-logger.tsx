"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Clock } from "lucide-react"
import { projectService } from "@/lib/projects"

const timeLogSchema = z.object({
  hours: z.coerce.number().positive("Hours must be greater than 0").max(24, "Hours cannot exceed 24 per entry"),
  notes: z.string().optional(),
})

type TimeLogValues = z.infer<typeof timeLogSchema>

interface JobTimeLoggerProps {
  projectId: string
  job: any
}

export default function JobTimeLogger({ projectId, job }: JobTimeLoggerProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<TimeLogValues>({
    resolver: zodResolver(timeLogSchema),
    defaultValues: {
      hours: 1,
      notes: "",
    },
  })

  async function onSubmit(values: TimeLogValues) {
    try {
      setIsLoading(true)

      await projectService.logJobTime(job.id, values.hours, values.notes)

      toast({
        title: "Time logged successfully",
        description: `${values.hours} hour(s) logged for job "${job.job_name}"`,
      })

      // Navigate back to job page
      router.push(`/projects/${projectId}/jobs/${job.id}`)
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
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
            <h2 className="text-lg font-medium">Time Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Estimated Hours:</span>{" "}
              <span className="font-medium">{job.estimated_hours || "Not set"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Hours Logged:</span>{" "}
              <span className="font-medium">{job.actual_hours || 0}</span>
            </div>
            {job.estimated_hours && (
              <div>
                <span className="text-muted-foreground">Remaining:</span>{" "}
                <span className="font-medium">{Math.max(0, job.estimated_hours - (job.actual_hours || 0))}</span>
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours Worked</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.25" min="0.25" max="24" placeholder="Enter hours worked" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter notes about the work performed" className="resize-none" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Logging..." : "Log Time"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
