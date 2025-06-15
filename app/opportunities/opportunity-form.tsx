"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { type NewOpportunity, opportunityService, OpportunityStatus, UpdateOpportunity } from "@/lib/opportunities" // Import OpportunityStatus
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area" // Import ScrollArea and ScrollBar
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"
import OpportunitySuggestions from "./components/opportunity-suggestions" // Import the new component

const opportunityFormSchema = z.object({
  opportunity_name: z.string().min(1, "Name is required"),
  description: z.string().nullable().optional(), // Allow null and undefined
  status: z.enum(["New Lead", "Contact Attempted", "Contacted", "Needs Scheduling", "Task Scheduled", "Needs Estimate", "Estimate Sent", "Estimate Accepted", "Estimate Rejected", "On Hold", "Lost"]).optional().default("New Lead"),
  person_id: z.string().min(1, "Contact is required"),
  estimated_value: z.coerce.number().optional().nullable(),
  requested_completion_date: z.date().optional().nullable(),
  assigned_user_id: z.string().optional().nullable(),
  created_by_user_id: z.string().optional().nullable(),
})

type OpportunityFormValues = {
  opportunity_name: string;
  description?: string | null;
  status?: OpportunityStatus; // Make it optional here
  person_id: string;
  estimated_value?: number | null;
  requested_completion_date?: Date | null;
  assigned_user_id?: string | null;
  created_by_user_id?: string | null;
};

interface OpportunityFormProps {
  initialData?: NewOpportunity
  opportunityId?: string
  personId?: string
}

export default function OpportunityForm({ initialData, opportunityId, personId }: OpportunityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [leadContacts, setLeadContacts] = useState<{ id: string; name: string }[]>([])
  const [customerContacts, setCustomerContacts] = useState<{ id: string; name: string }[]>([])
  // State for AI suggestions
  const [suggestedUpdates, setSuggestedUpdates] = useState<any[]>([])
  const [suggestedActions, setSuggestedActions] = useState<any[]>([])

  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunityFormSchema),
    defaultValues: {
      opportunity_name: initialData?.opportunity_name || "",
      description: initialData?.description || "",
      status: (initialData?.status as OpportunityStatus) || "New Lead", // Explicitly cast to OpportunityStatus
      person_id: initialData?.person_id || personId || "",
      estimated_value: initialData?.estimated_value || null,
      requested_completion_date: initialData?.requested_completion_date
        ? new Date(initialData.requested_completion_date)
        : null,
      assigned_user_id: initialData?.assigned_user_id || null,
      created_by_user_id: initialData?.created_by_user_id || null,
    },
  })

  // Load contacts when the component mounts
  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoadingContacts(true)
        const people = await personService.getPeople({ type: "lead" })
        const customers = await personService.getPeople({ type: "customer" })

        const formattedContacts = [...people, ...customers].map((person) => ({
          id: person.id,
          name: personService.getDisplayName(person),
          type: person.person_type,
        }))

        setContacts(formattedContacts)

        // Separate contacts by type for easier rendering
        setLeadContacts(
          people.map((person) => ({
            id: person.id,
            name: personService.getDisplayName(person),
          })),
        )

        setCustomerContacts(
          customers.map((person) => ({
            id: person.id,
            name: personService.getDisplayName(person),
          })),
        )
      } catch (error) {
        console.error("Failed to load contacts:", error)
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingContacts(false)
      }
    }

    loadContacts()
  }, [])

  async function onSubmit(values: OpportunityFormValues) {
    try {
      setIsLoading(true)

      // Format dates for API
      const formattedValues = {
        ...values,
        requested_completion_date: values.requested_completion_date instanceof Date
          ? values.requested_completion_date.toISOString().split("T")[0] // Format as YYYY-MM-DD
          : null,
      }

      if (opportunityId) {
        // Update existing opportunity
        await opportunityService.updateOpportunity(opportunityId, formattedValues as UpdateOpportunity)
        toast({
          title: "Opportunity updated",
          description: "Your opportunity has been updated successfully.",
        })
      } else {
        // Create new opportunity
        const newOpportunity = await opportunityService.createOpportunity(formattedValues as NewOpportunity)
        toast({
          title: "Opportunity created",
          description: "Your new opportunity has been created successfully.",
        })
        router.push(`/opportunities/${newOpportunity.id}`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save opportunity",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <ScrollArea className="h-[calc(100vh-8rem)] px-4"> {/* Adjust height as needed */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-4"> {/* Added vertical padding */}
          <FormField
            control={form.control}
            name="opportunity_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter opportunity name" {...field} />
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
                  <Textarea
                    placeholder="Enter opportunity description"
                    className="resize-none"
                    {...field}
                    value={field.value === null ? "" : field.value} // Convert null to empty string
                  />
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
                      <SelectItem value="New Lead">New Lead</SelectItem>
                      <SelectItem value="Contact Attempted">Contact Attempted</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Needs Scheduling">Needs Scheduling</SelectItem>
                      <SelectItem value="Task Scheduled">Task Scheduled</SelectItem>
                      <SelectItem value="Needs Estimate">Needs Estimate</SelectItem>
                      <SelectItem value="Estimate Sent">Estimate Sent</SelectItem>
                      <SelectItem value="Estimate Accepted">Estimate Accepted</SelectItem>
                      <SelectItem value="Estimate Rejected">Estimate Rejected</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Lost">Lost</SelectItem>
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
                  <FormLabel>Contact</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingContacts}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingContacts ? (
                        <SelectItem value="loading">Loading contacts...</SelectItem>
                      ) : (
                        <>
                          {leadContacts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Leads</SelectLabel>
                              {leadContacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}

                          {customerContacts.length > 0 && (
                            <SelectGroup>
                              <SelectLabel>Customers</SelectLabel>
                              {customerContacts.map((contact) => (
                                <SelectItem key={contact.id} value={contact.id}>
                                  {contact.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          )}

                          {leadContacts.length === 0 && customerContacts.length === 0 && (
                            <SelectItem value="no-contacts">No contacts found</SelectItem>
                          )}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={() => window.open("/people/new", "_blank")}
                    >
                      Create new contact
                    </Button>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estimated_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Value</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter estimated value"
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
              name="requested_completion_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Requested Completion Date</FormLabel>
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

          {/* AI Suggestions Section */}
          <OpportunitySuggestions
            suggestedUpdates={suggestedUpdates}
            suggestedActions={suggestedActions}
          />
          <ScrollBar orientation="vertical" />
        </form>
      </ScrollArea>
      <div className="flex justify-end space-x-2 p-4 border-t"> {/* Added padding and border-t */}
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : opportunityId ? "Update Opportunity" : "Create Opportunity"}
        </Button>
      </div>
    </Form>
  )
}
