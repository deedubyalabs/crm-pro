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
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { CostItem } from "@/types/cost-items"

// Define the form schema
const formSchema = z.object({
  item_code: z.string().min(1, "Item code is required"),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.enum(["Material", "Labor", "Equipment", "Subcontractor", "Other"]),
  unit: z.string().min(1, "Unit is required"),
  unit_cost: z.coerce.number().min(0, "Unit cost must be a positive number"),
  default_markup: z.coerce.number().min(0, "Markup must be a positive number"),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof formSchema>

interface CostItemFormProps {
  costItem?: CostItem
  onSubmit: (values: FormValues) => Promise<void>
}

export function CostItemForm({ costItem, onSubmit }: CostItemFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values or existing cost item data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: costItem
      ? {
          ...costItem,
          unit_cost: costItem.unit_cost,
          default_markup: costItem.default_markup,
        }
      : {
          item_code: "",
          name: "",
          description: "",
          type: "Material",
          unit: "EA",
          unit_cost: 0,
          default_markup: 0,
          is_active: true,
        },
  })

  // Handle form submission
  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
      toast({
        title: costItem ? "Cost item updated" : "Cost item created",
        description: costItem
          ? "The cost item has been updated successfully."
          : "The cost item has been created successfully.",
      })
      router.push("/cost-items")
    } catch (error) {
      console.error("Error submitting form:", error)
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
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{costItem ? "Edit Cost Item" : "New Cost Item"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="item_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item code" {...field} />
                    </FormControl>
                    <FormDescription>A unique code to identify this cost item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter name" {...field} />
                    </FormControl>
                    <FormDescription>The name of the cost item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter description"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>A detailed description of the cost item</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Material">Material</SelectItem>
                        <SelectItem value="Labor">Labor</SelectItem>
                        <SelectItem value="Equipment">Equipment</SelectItem>
                        <SelectItem value="Subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The category of this cost item</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EA">Each (EA)</SelectItem>
                        <SelectItem value="HR">Hour (HR)</SelectItem>
                        <SelectItem value="DAY">Day (DAY)</SelectItem>
                        <SelectItem value="FT">Feet (FT)</SelectItem>
                        <SelectItem value="SQ FT">Square Feet (SQ FT)</SelectItem>
                        <SelectItem value="LF">Linear Feet (LF)</SelectItem>
                        <SelectItem value="BOX">Box (BOX)</SelectItem>
                        <SelectItem value="ROLL">Roll (ROLL)</SelectItem>
                        <SelectItem value="GAL">Gallon (GAL)</SelectItem>
                        <SelectItem value="LB">Pound (LB)</SelectItem>
                        <SelectItem value="SET">Set (SET)</SelectItem>
                        <SelectItem value="LOT">Lot (LOT)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>The unit of measurement</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>The cost per unit</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Markup (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>The default markup percentage</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>Inactive items won't appear in dropdown menus for new estimates</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/cost-items")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : costItem ? "Update Cost Item" : "Create Cost Item"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
