"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { MaterialListWithDetails } from "@/types/material-lists"
import type { Supplier } from "@/types/suppliers"

// Define the form schema
const formSchema = z.object({
  group_by_supplier: z.boolean().default(true),
  supplier_id: z.string().optional(),
  delivery_date: z.date().optional().nullable(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CreatePurchaseOrderFormProps {
  materialList: MaterialListWithDetails
  suppliers: Supplier[]
}

export default function CreatePurchaseOrderForm({ materialList, suppliers }: CreatePurchaseOrderFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      group_by_supplier: true,
      supplier_id: "",
      delivery_date: null,
      notes: `Generated from material list: ${materialList.name}`,
    },
  })

  // Watch for group_by_supplier changes
  const groupBySupplier = form.watch("group_by_supplier")

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/material-lists/${materialList.id}/generate-purchase-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          delivery_date: values.delivery_date ? values.delivery_date.toISOString() : undefined,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to generate purchase orders")
      }

      const data = await response.json()

      toast({
        title: "Purchase orders generated",
        description: `Successfully created ${data.length} purchase order(s).`,
      })

      // Redirect to the first PO if only one was created, otherwise go to PO list
      if (data.length === 1) {
        router.push(`/purchase-orders/${data[0].id}`)
      } else {
        router.push("/purchase-orders")
      }
    } catch (error) {
      console.error("Error generating purchase orders:", error)
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
            <CardTitle>Purchase Order Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="group_by_supplier"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Group by Supplier</FormLabel>
                    <FormDescription>Create separate purchase orders for each supplier</FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {!groupBySupplier && (
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supplier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="no-supplier">No supplier (draft)</SelectItem>
                        {suppliers.map((supplier) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Select a supplier for this purchase order</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="delivery_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Delivery Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
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
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>When the materials should be delivered (optional)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes for the purchase order"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Additional notes or instructions for the supplier</FormDescription>
                  <FormMessage />
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
            {isSubmitting ? "Generating..." : "Generate Purchase Order"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
