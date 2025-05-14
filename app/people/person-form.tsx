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
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"
import type { Person } from "@/lib/people"
import { TagInput } from "@/components/tag-input"

const personSchema = z
  .object({
    person_type: z.string().min(1, "Type is required"),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    business_name: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().optional(),
    state_province: z.string().optional(),
    postal_code: z.string().optional(),
    lead_source: z.string().optional(),
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // For businesses and subcontractors, business_name is required
      if (
        (data.person_type.toLowerCase() === "business" || data.person_type.toLowerCase() === "subcontractor") &&
        !data.business_name
      ) {
        return false
      }
      // For individuals, at least first_name or last_name is required
      if (
        data.person_type.toLowerCase() !== "business" &&
        data.person_type.toLowerCase() !== "subcontractor" &&
        !data.first_name &&
        !data.last_name
      ) {
        return false
      }
      return true
    },
    {
      message: "Name is required (business name for businesses/subcontractors, first or last name for individuals)",
      path: ["business_name"],
    },
  )

type PersonFormValues = z.infer<typeof personSchema>

interface PersonFormProps {
  initialData?: Person
  isEdit?: boolean
}

export default function PersonForm({ initialData, isEdit = false }: PersonFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: initialData
      ? {
          // Convert to lowercase for UI display
          person_type: initialData.person_type.toLowerCase(),
          first_name: initialData.first_name || "",
          last_name: initialData.last_name || "",
          business_name: initialData.business_name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          address_line1: initialData.address_line1 || "",
          address_line2: initialData.address_line2 || "",
          city: initialData.city || "",
          state_province: initialData.state_province || "",
          postal_code: initialData.postal_code || "",
          lead_source: initialData.lead_source || "",
          notes: initialData.notes || "",
          tags: initialData.tags || [],
        }
      : {
          person_type: "lead",
          first_name: "",
          last_name: "",
          business_name: "",
          email: "",
          phone: "",
          address_line1: "",
          address_line2: "",
          city: "",
          state_province: "",
          postal_code: "",
          lead_source: "",
          notes: "",
          tags: [],
        },
  })

  const personType = form.watch("person_type")
  const isBusinessOrSubcontractor = personType === "business" || personType === "subcontractor"

  async function onSubmit(values: PersonFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Submitting form with values:", values)

      if (isEdit && initialData) {
        await personService.updatePerson(initialData.id, values)
        toast({
          title: "Contact updated",
          description: "The contact has been updated successfully.",
        })
      } else {
        await personService.createPerson(values)
        toast({
          title: "Contact created",
          description: "The new contact has been created successfully.",
        })
      }
      router.push("/people")
      router.refresh()
    } catch (error) {
      console.error("Form submission error:", error)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="person_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="subcontractor">Subcontractor</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The type of contact determines available actions and workflows.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lead_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Where this contact came from (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isBusinessOrSubcontractor ? (
          <FormField
            control={form.control}
            name="business_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business name" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address_line1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 1</FormLabel>
              <FormControl>
                <Input placeholder="Enter street address" {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address_line2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address Line 2</FormLabel>
              <FormControl>
                <Input placeholder="Apt, Suite, Unit, etc." {...field} disabled={isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state_province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State/Province</FormLabel>
                <FormControl>
                  <Input placeholder="State/Province" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="Postal Code" {...field} disabled={isSubmitting} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  placeholder="Type and press Enter to add tags"
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>Add tags to categorize and filter contacts (press Enter after each tag)</FormDescription>
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
                  placeholder="Add any additional notes about this contact"
                  className="min-h-[100px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Update Contact" : "Create Contact"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
