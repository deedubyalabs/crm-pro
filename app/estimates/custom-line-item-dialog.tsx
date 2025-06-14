"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { EstimateLineItem } from "@/types/estimates"
import type { User } from "@/types/auth"
import { supabase } from "@/lib/supabase"

const customLineItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  unit_cost: z.coerce.number().min(0, "Unit cost cannot be negative"),
  markup: z.coerce.number().min(0).max(100).optional(),
  is_optional: z.boolean().optional(),
  is_taxable: z.boolean().optional(),
  assigned_to_user_id: z.string().optional().nullable(),
  section_name: z.string().optional().nullable(),
})

type CustomLineItemFormValues = z.infer<typeof customLineItemSchema>

interface CustomLineItemDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddCustomItem: (item: Partial<EstimateLineItem>) => void
  sections: string[]
}

export function CustomLineItemDialog({
  isOpen,
  onClose,
  onAddCustomItem,
  sections,
}: CustomLineItemDialogProps) {
  const [users, setUsers] = useState<User[]>([]);

  const form = useForm<CustomLineItemFormValues>({
    resolver: zodResolver(customLineItemSchema),
    defaultValues: {
      description: "",
      quantity: 1,
      unit: "EA",
      unit_cost: 0,
      markup: undefined, // Default to undefined to align with optional() schema
      is_optional: false,
      is_taxable: true,
      assigned_to_user_id: null,
      section_name: null,
    },
  })

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("id, first_name, last_name");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data as User[]);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = (values: CustomLineItemFormValues) => {
    onAddCustomItem({
      description: values.description,
      quantity: values.quantity,
      unit: values.unit,
      unit_cost: values.unit_cost,
      markup: values.markup,
      is_optional: values.is_optional,
      is_taxable: values.is_taxable,
      assigned_to_user_id: values.assigned_to_user_id === "none" ? null : values.assigned_to_user_id,
      section_name: values.section_name === "none" ? null : values.section_name,
    })
    form.reset()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Custom Line Item</DialogTitle>
          <DialogDescription>
            Create a one-time line item.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter item description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EA">EA</SelectItem>
                        <SelectItem value="HR">HR</SelectItem>
                        <SelectItem value="DAY">DAY</SelectItem>
                        <SelectItem value="FT">FT</SelectItem>
                        <SelectItem value="SQ FT">SQ FT</SelectItem>
                        <SelectItem value="LF">LF</SelectItem>
                        <SelectItem value="BOX">BOX</SelectItem>
                        <SelectItem value="ROLL">ROLL</SelectItem>
                        <SelectItem value="GAL">GAL</SelectItem>
                        <SelectItem value="LB">LB</SelectItem>
                        <SelectItem value="SET">SET</SelectItem>
                        <SelectItem value="LOT">LOT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Cost</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="markup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Markup (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="section_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || "none"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Section</SelectItem>
                        {sections.map((sectionName) => (
                          sectionName !== "" && (
                            <SelectItem key={sectionName} value={sectionName}>
                              {sectionName}
                            </SelectItem>
                          )
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_optional"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Optional</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_taxable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Taxable</FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assigned_to_user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || "none"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign to user (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  form.handleSubmit((values) => {
                    onAddCustomItem({
                      description: values.description,
                      quantity: values.quantity,
                      unit: values.unit,
                      unit_cost: values.unit_cost,
                      markup: values.markup,
                      is_optional: values.is_optional,
                      is_taxable: values.is_taxable,
                      assigned_to_user_id: values.assigned_to_user_id === "none" ? null : values.assigned_to_user_id,
                      section_name: values.section_name === "none" ? null : values.section_name,
                    });
                    form.reset({
                      description: "",
                      quantity: 1,
                      unit: "EA",
                      unit_cost: 0,
                      markup: undefined,
                      is_optional: false,
                      is_taxable: true,
                      assigned_to_user_id: null,
                      section_name: null,
                    });
                  })();
                }}
              >
                Add Item and Create Another
              </Button>
              <Button type="submit">Add Item</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
