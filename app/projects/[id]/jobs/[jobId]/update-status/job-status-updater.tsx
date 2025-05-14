"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"
import { projectService } from "@/lib/projects"
import { CheckCircle, AlertCircle, XCircle, PlayCircle, PauseCircle, Calendar } from "lucide-react"

const statusSchema = z.object({
  status: z.enum(["Pending", "Scheduled", "In Progress", "Blocked", "Completed", "Canceled"]),
  notes: z.string().optional(),
})

type StatusValues = z.infer<typeof statusSchema>

interface JobStatusUpdaterProps {
  projectId: string
  job: any
}

export default function JobStatusUpdater({ projectId, job }: JobStatusUpdaterProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<StatusValues>({
    resolver: zodResolver(statusSchema),
    defaultValues: {
      status: job.status as any,
      notes: "",
    },
  })

  async function onSubmit(values: StatusValues) {
    try {
      setIsLoading(true)

      await projectService.updateJobStatus(job.id, values.status)

      toast({
        title: "Status updated",
        description: `Job status updated to "${values.status}"`,
      })

      // Navigate back to job page
      router.push(`/projects/${projectId}/jobs/${job.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Pending" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <PauseCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                          Pending
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Scheduled" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                          Scheduled
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="In Progress" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <PlayCircle className="h-4 w-4 mr-2 text-green-600" />
                          In Progress
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Blocked" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2 text-amber-600" />
                          Blocked
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Completed" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-purple-600" />
                          Completed
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="Canceled" />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer flex items-center">
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Canceled
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <FormLabel>Status Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter notes about this status change" className="resize-none" {...field} />
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
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
