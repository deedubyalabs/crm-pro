"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { createChangeOrder, getNextChangeOrderNumber, updateChangeOrder } from "@/lib/change-orders"

const changeOrderSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  person_id: z.string().min(1, "Customer is required"),
  co_number: z.string().optional(),
  status: z.enum(["Requested", "Pending", "Approved", "Rejected", "Completed"]),
  description: z.string().min(1, "Description is required"),
  reason: z.string().optional(),
  cost_impact: z.coerce.number().default(0),
  time_impact_days: z.coerce.number().default(0),
  approved_by_person_id: z.string().optional(),
  approved_at: z.date().optional(),
  line_items: z
    .array(
      z.object({
        id: z.string().optional(),
        cost_item_id: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
        unit: z.string().min(1, "Unit is required"),
        unit_cost: z.coerce.number().min(0, "Unit cost must be 0 or greater"),
        markup: z.coerce.number().min(0, "Markup must be 0 or greater"),
        total: z.coerce.number(),
        sort_order: z.number().default(0),
      }),
    )
    .default([]),
})

type ChangeOrderFormValues = z.infer<typeof changeOrderSchema>

interface ChangeOrderFormProps {
  projects: { id: string; project_name: string }[]
  people: { id: string; full_name: string }[]
  initialData?: any
}

export default function ChangeOrderForm({ projects, people, initialData }: ChangeOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalCost, setTotalCost] = useState(initialData?.cost_impact || 0)
  const isCalculating = useRef(false)

  const form = useForm<ChangeOrderFormValues>({
    resolver: zodResolver(changeOrderSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          approved_at: initialData.approved_at ? new Date(initialData.approved_at) : undefined,
          line_items: initialData.line_items || [],
        }
      : {
          status: "Requested",
          cost_impact: 0,
          time_impact_days: 0,
          line_items: [],
        },
  })

  // Watch for changes to quantity, unit_cost, and markup
  const watchLineItems = form.watch("line_items")

  // Calculate line item totals when relevant fields change
  useEffect(() => {
    if (isCalculating.current) return

    isCalculating.current = true

    try {
      const lineItems = form.getValues("line_items")
      let needsUpdate = false

      // Calculate each line item's total only if needed
      const updatedLineItems = lineItems.map((item) => {
        const calculatedTotal = Number(item.quantity) * Number(item.unit_cost) * (1 + Number(item.markup) / 100)
        const roundedTotal = Number.parseFloat(calculatedTotal.toFixed(2))

        if (Math.abs(roundedTotal - item.total) > 0.001) {
          needsUpdate = true
          return { ...item, total: roundedTotal }
        }

        return item
      })

      // Only update if totals have changed
      if (needsUpdate) {
        form.setValue("line_items", updatedLineItems, { shouldDirty: true })
      }

      // Calculate total cost impact
      const newTotalCost = updatedLineItems.reduce((sum, item) => sum + (item.total || 0), 0)
      const roundedTotalCost = Number.parseFloat(newTotalCost.toFixed(2))

      if (Math.abs(roundedTotalCost - totalCost) > 0.001) {
        setTotalCost(roundedTotalCost)
        form.setValue("cost_impact", roundedTotalCost, { shouldDirty: true })
      }
    } finally {
      isCalculating.current = false
    }
  }, [watchLineItems, form, totalCost])

  // Fetch next change order number if creating new
  useEffect(() => {
    if (!initialData) {
      const fetchNextNumber = async () => {
        try {
          const nextNumber = await getNextChangeOrderNumber()
          form.setValue("co_number", nextNumber)
        } catch (error) {
          console.error("Error fetching next change order number:", error)
        }
      }
      fetchNextNumber()
    }
  }, [form, initialData])

  const addLineItem = () => {
    const currentLineItems = form.getValues("line_items")
    form.setValue("line_items", [
      ...currentLineItems,
      {
        description: "",
        quantity: 1,
        unit: "ea",
        unit_cost: 0,
        markup: 0,
        total: 0,
        sort_order: currentLineItems.length,
      },
    ])
  }

  const removeLineItem = (index: number) => {
    const currentLineItems = form.getValues("line_items")
    const updatedLineItems = currentLineItems.filter((_, i) => i !== index)
    form.setValue("line_items", updatedLineItems)
  }

  const onSubmit = async (data: ChangeOrderFormValues) => {
    setIsSubmitting(true)
    try {
      if (initialData) {
        await updateChangeOrder(initialData.id, data)
      } else {
        const id = await createChangeOrder(data)
        router.push(`/change-orders/${id}`)
        return
      }
      router.push("/change-orders")
    } catch (error) {
      console.error("Error saving change order:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name}
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
            name="person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.full_name}
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
            name="co_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Change Order Number</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} readOnly />
                </FormControl>
                <FormDescription>Automatically generated</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                    <SelectItem value="Requested">Requested</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
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
                <Textarea placeholder="Describe the change order" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reason for Change</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Explain why this change is needed"
                  className="min-h-[100px]"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="time_impact_days"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time Impact (Days)</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormDescription>Number of days this change will add to the project timeline</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("status") === "Approved" && (
            <>
              <FormField
                control={form.control}
                name="approved_by_person_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved By</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a person" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {people.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.full_name}
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
                name="approved_at"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Approval Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={`w-full pl-3 text-left font-normal ${
                              !field.value ? "text-muted-foreground" : ""
                            }`}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Line Items</h3>
            <Button type="button" onClick={addLineItem} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </div>

          {watchLineItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No line items added. Click "Add Item" to add a line item.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {watchLineItems.map((_, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      <Button type="button" onClick={() => removeLineItem(index)} variant="ghost" size="sm">
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`line_items.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`line_items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`line_items.${index}.unit`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`line_items.${index}.unit_cost`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Cost</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`line_items.${index}.markup`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Markup %</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" min="0" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name={`line_items.${index}.total`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Total</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" readOnly {...field} />
                            </FormControl>
                            <FormDescription>Calculated automatically</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div>
            <p className="text-sm font-medium">Total Cost Impact:</p>
            <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
          </div>
          <div className="space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update" : "Create"} Change Order
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
