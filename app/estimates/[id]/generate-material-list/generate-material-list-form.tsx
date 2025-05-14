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
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { EstimateWithDetails } from "@/types/estimates"
import type { ProjectWithCustomer } from "@/lib/projects"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  project_id: z.string().min(1, "Project is required"),
  apply_waste_factors: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface GenerateMaterialListFormProps {
  estimate: EstimateWithDetails
  project: ProjectWithCustomer | null
}

export default function GenerateMaterialListForm({ estimate, project }: GenerateMaterialListFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `Material List for ${estimate.estimate_number || "Estimate"}`,
      description: `Generated from estimate ${estimate.estimate_number || estimate.id}`,
      project_id: project?.id || "",
      apply_waste_factors: true,
    },
  })

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/estimates/${estimate.id}/generate-material-list`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate material list")
      }

      const data = await response.json()

      toast({
        title: "Material list generated",
        description: "The material list has been created successfully.",
      })

      router.push(`/material-lists/${data.id}`)
    } catch (error) {
      console.error("Error generating material list:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Material List Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter material list name" {...field} />
                  </FormControl>
                  <FormDescription>A descriptive name for this material list</FormDescription>
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
                    <Textarea
                      placeholder="Enter description or notes"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Additional notes or details about this material list</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="project_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {project ? (
                        <SelectItem value={project.id}>{project.project_name}</SelectItem>
                      ) : (
                        <SelectItem value="" disabled>
                          No projects available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>The project this material list is for</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apply_waste_factors"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Apply Waste Factors</FormLabel>
                    <FormDescription>Automatically add waste factors based on material types</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Generating..." : "Generate Material List"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
