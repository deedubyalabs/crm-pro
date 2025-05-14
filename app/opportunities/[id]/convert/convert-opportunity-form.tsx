"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { projectService } from "@/lib/projects"
import { opportunityService } from "@/lib/opportunities"
import type { Opportunity } from "@/lib/opportunities"

// Define the valid project status values based on the database enum
const PROJECT_STATUS = [
  "Pending Start",
  "Planning",
  "In Progress",
  "On Hold",
  "Awaiting Change Order Approval",
  "Nearing Completion",
  "Completed",
  "Canceled",
] as const

const convertFormSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.enum(PROJECT_STATUS),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  budget: z.coerce.number().optional().nullable(),
  copy_address: z.boolean().default(true),
  update_opportunity_status: z.boolean().default(true),
})

type ConvertFormValues = z.infer<typeof convertFormSchema>

interface ConvertOpportunityFormProps {
  opportunity: Opportunity
}

export default function ConvertOpportunityForm({ opportunity }: ConvertOpportunityFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ConvertFormValues>({
    resolver: zodResolver(convertFormSchema),
    defaultValues: {
      project_name: opportunity.opportunity_name,
      description: opportunity.description || "",
      status: "Pending Start", // Default to a valid status from the enum
      start_date: null,
      end_date: opportunity.requested_completion_date ? new Date(opportunity.requested_completion_date) : null,
      budget: opportunity.estimated_value || null,
      copy_address: true,
      update_opportunity_status: true,
    },
  })

  async function onSubmit(values: ConvertFormValues) {
    setIsSubmitting(true)
    try {
      // Create a new project
      const newProject = await projectService.createProject({
        person_id: opportunity.person_id,
        opportunity_id: opportunity.id,
        project_name: values.project_name,
        description: values.description,
        status: values.status,
        planned_start_date: values.start_date ? values.start_date.toISOString().split("T")[0] : null,
        planned_end_date: values.end_date ? values.end_date.toISOString().split("T")[0] : null,
        budget_amount: values.budget,
        // Copy address if selected
        ...(values.copy_address && opportunity.address
          ? {
              project_address_line1: opportunity.address,
              project_city: opportunity.city || null,
              project_state_province: opportunity.state_province || null,
              project_postal_code: opportunity.postal_code || null,
              project_country: opportunity.country || null,
            }
          : {}),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      // Update opportunity status if selected
      if (values.update_opportunity_status) {
        await opportunityService.updateOpportunity(opportunity.id, {
          status: "Estimate Accepted", // Use a valid opportunity status
          updated_at: new Date().toISOString(),
        })
      }

      toast({
        title: "Opportunity converted",
        description: "The opportunity has been successfully converted to a project.",
      })

      // Redirect to the new project
      router.push(`/projects/${newProject.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to convert opportunity",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="project_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter project description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PROJECT_STATUS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter budget amount"
                    {...field}
                    value={field.value === null ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.value === "" ? null : Number(e.target.value)
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="copy_address"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Copy address from opportunity</FormLabel>
                  <FormDescription>Use the address information from the opportunity for this project.</FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="update_opportunity_status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Update opportunity status</FormLabel>
                  <FormDescription>
                    Mark the opportunity as &quot;Estimate Accepted&quot; after creating the project.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Converting..." : "Convert to Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
