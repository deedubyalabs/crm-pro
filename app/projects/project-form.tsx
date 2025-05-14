"use client"

import { useState, useEffect } from "react" // Keep useEffect
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
import { type NewProject, projectService } from "@/lib/projects"
import { toast } from "@/components/ui/use-toast"
import type { EstimateWithDetails } from "@/types/estimates" // Import EstimateWithDetails
import type { Person } from "@/lib/people" // Import Person type
import { formatCurrency } from "@/lib/utils" // Import formatCurrency

// Define ProjectStatus type based on Supabase enum
export type ProjectStatus = "Pending Start" | "Planning" | "In Progress" | "On Hold" | "Awaiting Change Order Approval" | "Nearing Completion" | "Completed" | "Canceled";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  customer_id: z.string().optional(),
  opportunity_id: z.string().optional(), // Add opportunity_id to schema
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  budget: z.coerce.number().optional().nullable(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  notes: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectFormSchema>

interface ProjectFormProps {
  initialData?: NewProject
  projectId?: string
  initialEstimate?: EstimateWithDetails | null; // Add initialEstimate prop
  initialPerson?: Person | null; // Add initialPerson prop
}

export default function ProjectForm({ initialData, projectId, initialEstimate, initialPerson }: ProjectFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialEstimate?.opportunity?.opportunity_name || initialData?.project_name || "", // Pre-fill from estimate opportunity name or initialData project_name
      description: initialEstimate?.notes || initialData?.description || "", // Pre-fill from estimate notes or initialData description
      status: initialData?.status || "Pending Start", // Default to Pending Start
      customer_id: initialEstimate?.person_id || initialData?.person_id || undefined, // Pre-fill from estimate person_id or initialData person_id
      opportunity_id: initialEstimate?.opportunity_id || initialData?.opportunity_id || undefined, // Pre-fill from estimate opportunity_id or initialData opportunity_id
      start_date: initialData?.planned_start_date ? new Date(initialData.planned_start_date) : null, // Use planned_start_date from initialData
      end_date: initialData?.planned_end_date ? new Date(initialData.planned_end_date) : null, // Use planned_end_date from initialData
      budget: initialEstimate?.total_amount || initialData?.budget_amount || null, // Pre-fill from estimate total_amount or initialData budget_amount
      address: initialPerson?.address_line1 || initialData?.project_address_line1 || "", // Pre-fill from initialPerson address or initialData project_address_line1
      city: initialPerson?.city || initialData?.project_city || "", // Pre-fill from initialPerson city or initialData project_city
      state: initialPerson?.state_province || initialData?.project_state_province || "", // Pre-fill from initialPerson state or initialData project_state_province
      zip: initialPerson?.postal_code || initialData?.project_postal_code || "", // Pre-fill from initialPerson zip or initialData project_postal_code
      notes: initialData?.notes || "", // Keep existing notes logic or decide if estimate notes should append
    },
  })

  async function onSubmit(values: ProjectFormValues) {
    try {
      setIsLoading(true)

      // Format dates for API and map to NewProject type
      const projectData: NewProject = {
        person_id: values.customer_id!, // customer_id in form maps to person_id in NewProject
        opportunity_id: values.opportunity_id,
        project_name: values.name, // name in form maps to project_name in NewProject
        status: values.status as NewProject['status'], // Cast status
        planned_start_date: values.start_date ? values.start_date.toISOString() : null, // Map start_date
        planned_end_date: values.end_date ? values.end_date.toISOString() : null, // Map end_date
        budget_amount: values.budget, // Map budget
        project_address_line1: values.address, // Map address
        project_city: values.city, // Map city
        project_state_province: values.state, // Map state
        project_postal_code: values.zip, // Map zip
        description: values.description, // Map description
        notes: values.notes, // Map notes
        estimate_id: initialEstimate?.id || undefined, // Include estimate_id if creating from an estimate
      }

      if (projectId) {
        // Update existing project
        await projectService.updateProject(projectId, projectData) // Use projectData
        toast({
          title: "Project updated",
          description: "Your project has been updated successfully.",
        })
      } else {
        // Create new project
        const newProject = await projectService.createProject(projectData) // Use projectData
        toast({
          title: "Project created",
          description: "Your new project has been created successfully.",
        })
        router.push(`/projects/${newProject.id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
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
          <h3 className="text-lg font-medium">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input placeholder="State" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input placeholder="ZIP" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter any additional notes" className="resize-none" rows={4} {...field} />
              </FormControl>
              <FormDescription>
                Internal notes about this project that are not shared with the customer.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : projectId ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
