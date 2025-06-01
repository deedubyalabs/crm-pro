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
import { changeOrderService } from "@/lib/change-orders" // Import the service
import { ChangeOrder, ChangeOrderLineItem, ChangeOrderWithDetails, CreateChangeOrderParams, UpdateChangeOrderParams } from "@/types/change-orders" // Import types
import { ImportLineItemsDrawer } from "./components/import-line-items-drawer" // Import the new drawer

const changeOrderSchema = z.object({
  project_id: z.string().min(1, "Project is required"),
  person_id: z.string().min(1, "Customer is required"),
  change_order_number: z.string().optional(),
  status: z.enum(["Draft", "Pending Approval", "Approved", "Rejected", "Implemented", "Canceled"]),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  reason: z.string().optional(),
  total_amount: z.coerce.number().default(0),
  impact_on_timeline: z.coerce.number().default(0),
  approved_by_person_id: z.string().optional(),
  approval_date: z.date().optional(),
  line_items: z
    .array(
      z.object({
        id: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
        unit: z.string().min(1, "Unit is required"),
        unit_price: z.coerce.number().min(0, "Unit price must be 0 or greater"),
        // Removed markup from schema as it's not a database column
        total: z.coerce.number(),
        sort_order: z.number().default(0),
      }),
    )
    .default([]),
})

export interface ChangeOrderFormValues { // Exported the interface
  project_id: string;
  person_id: string;
  change_order_number?: string;
  status: "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Implemented" | "Canceled";
  title: string;
  description: string;
  reason?: string;
  total_amount: number;
  impact_on_timeline: number;
  approved_by_person_id?: string;
  approval_date?: Date;
  line_items: Array<{
    id?: string; // Optional ID for existing items
    description: string;
    quantity: number;
    unit: string;
    unit_price: number;
    // Removed markup from type
    total: number;
    sort_order: number;
  }>;
}

interface ChangeOrderFormProps {
  projects: { id: string; project_name: string }[]
  people: { id: string; full_name: string }[]
  initialData?: ChangeOrderWithDetails
  onSubmit: (data: ChangeOrderFormValues) => Promise<void>
}

export default function ChangeOrderForm({ projects, people, initialData, onSubmit }: ChangeOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalAmount, setTotalAmount] = useState(initialData?.total_amount || 0) // Renamed totalCost to totalAmount
  const isCalculating = useRef(false)
  const [isImportDrawerOpen, setIsImportDrawerOpen] = useState(false) // State for import drawer

  const form = useForm<any>({ // Use any to bypass complex type inference issues
    resolver: zodResolver(changeOrderSchema),
    defaultValues: (initialData ? {
      project_id: initialData.project_id,
      person_id: initialData.person_id,
      change_order_number: initialData.change_order_number ?? undefined,
      status: initialData.status,
      title: initialData.title,
      description: initialData.description ?? "",
      reason: initialData.reason ?? undefined,
      total_amount: initialData.total_amount,
      impact_on_timeline: initialData.impact_on_timeline ?? 0,
      approved_by_person_id: initialData.approved_by_person_id ?? undefined,
      approval_date: initialData.approval_date ? new Date(initialData.approval_date) : undefined,
      line_items: initialData.line_items?.map((item: ChangeOrderLineItem) => ({
        ...item,
        description: item.description || "",
        quantity: item.quantity || 0,
        unit: item.unit || "",
        unit_price: item.unit_price || 0,
        // markup is not a database column, so it's not included here
        total: item.total || 0,
        sort_order: item.sort_order || 0,
      })) || [],
    } : {
      project_id: "",
      person_id: "",
      status: "Draft",
      title: "",
      description: "",
      total_amount: 0,
      impact_on_timeline: 0,
      line_items: [],
    }),
  })

  // Watch for changes to quantity, unit_price, and markup
  const watchLineItems = form.watch("line_items")

  // Calculate line item totals when relevant fields change
  useEffect(() => {
    if (isCalculating.current) return

    isCalculating.current = true

    try {
      const lineItems = form.getValues("line_items")
      let needsUpdate = false

      // Calculate each line item's total only if needed (removed markup from calculation)
      const updatedLineItems = lineItems.map((item: { quantity: number; unit_price: number; total: number }) => {
        const calculatedTotal = Number(item.quantity) * Number(item.unit_price)
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

      // Calculate total amount
      const newTotalAmount = updatedLineItems.reduce((sum: number, item: { total: number }) => sum + (item.total || 0), 0)
      const roundedTotalAmount = Number.parseFloat(newTotalAmount.toFixed(2))

      if (Math.abs(roundedTotalAmount - totalAmount) > 0.001) {
        setTotalAmount(roundedTotalAmount)
        form.setValue("total_amount", roundedTotalAmount, { shouldDirty: true })
      }
    } finally {
      isCalculating.current = false
    }
  }, [watchLineItems, form, totalAmount])

  // Fetch next change order number if creating new and co_number is not set
  useEffect(() => {
    if (!initialData?.change_order_number) { // Check if initialData exists and co_number is not set
      const fetchNextNumber = async () => {
        try {
          const nextNumber = await changeOrderService.getNextChangeOrderNumber()
          form.setValue("change_order_number", nextNumber)
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
        unit_price: 0, // Renamed unit_cost to unit_price
        markup: 0,
        total: 0,
        sort_order: currentLineItems.length,
      },
    ])
  }

  const removeLineItem = (index: number) => {
    const currentLineItems = form.getValues("line_items")
    const updatedLineItems = currentLineItems.filter((_item: any, i: number) => i !== index) // Explicitly type _item and i
    form.setValue("line_items", updatedLineItems)
  }

  const handleFormSubmit = async (data: ChangeOrderFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data) // Call the onSubmit prop
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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
            name="change_order_number" // Renamed
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
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Pending Approval">Pending Approval</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Implemented">Implemented</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="title" // Added title field
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Short title for the change order" {...field} />
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
            name="impact_on_timeline" // Renamed
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
                name="approval_date" // Renamed
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
            <div className="space-x-2">
              <Button type="button" onClick={() => setIsImportDrawerOpen(true)} variant="outline" size="sm">
                Import Items
              </Button>
              <Button type="button" onClick={addLineItem} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
          </div>

          {watchLineItems.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No line items added. Click "Add Item" to add a line item.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {watchLineItems.map((_item: any, index: number) => ( // Explicitly type _item and index
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
                          name={`line_items.${index}.unit_price`} // Renamed
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Unit Price</FormLabel>
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
            <p className="text-sm font-medium">Total Amount:</p>
            <p className="text-2xl font-bold">${totalAmount.toFixed(2)}</p>
          </div>
          <div className="space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            {initialData && initialData.status === "Draft" && (
              <Button
                type="button"
                onClick={() => {
                  form.setValue("status", "Pending Approval", { shouldDirty: true });
                  form.handleSubmit(handleFormSubmit)();
                }}
                disabled={isSubmitting}
                variant="secondary"
              >
                {isSubmitting && form.getValues("status") === "Pending Approval" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit for Approval
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && form.getValues("status") !== "Pending Approval" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update" : "Create"} Change Order
            </Button>
          </div>
        </div>
      </form>

      {/* Import Line Items Drawer */}
      {isImportDrawerOpen && (
        <ImportLineItemsDrawer
          isOpen={isImportDrawerOpen}
          onClose={() => setIsImportDrawerOpen(false)}
          projectId={form.watch("project_id")} // Pass the current project ID
          onImport={(importedItems) => {
            const currentLineItems = form.getValues("line_items")
            form.setValue("line_items", [...currentLineItems, ...importedItems])
          }}
        />
      )}
    </Form>
  )
}
