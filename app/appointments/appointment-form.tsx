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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addHours } from "date-fns"
import { CalendarIcon, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { type NewAppointment, appointmentService } from "@/lib/appointments"
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"

const appointmentFormSchema = z.object({
  appointment_type: z.string().min(1, "Title is required"), // Changed from title to appointment_type
  description: z.string().optional(), // Kept description as it's used for notes
  start_time: z.date({
    required_error: "Start time is required",
  }),
  end_time: z.date({
    required_error: "End time is required",
  }),
  address: z.string().optional(), // Changed from location to address
  status: z.string().min(1, "Status is required"),
  person_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
  // Removed assigned_to as it's not in the Supabase schema
})

type AppointmentFormValues = z.infer<typeof appointmentFormSchema>

interface AppointmentFormProps {
  initialData?: NewAppointment
  appointmentId?: string
}

export default function AppointmentForm({ initialData, appointmentId }: AppointmentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  // Set default start and end times (now and 1 hour from now)
  const now = new Date()
  const oneHourLater = addHours(now, 1)

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      appointment_type: initialData?.appointment_type || "", // Use appointment_type
      description: initialData?.notes || "", // Map initialData notes to form description
      start_time: initialData?.start_time ? new Date(initialData.start_time) : now,
      end_time: initialData?.end_time ? new Date(initialData.end_time) : oneHourLater,
      address: initialData?.address || "", // Use address
      status: initialData?.status || "Scheduled", // Use correct enum default
      person_id: initialData?.person_id || undefined,
      opportunity_id: initialData?.opportunity_id || undefined,
      project_id: initialData?.project_id || undefined,
      notes: initialData?.notes || "", // Keep notes for internal use
    },
  })

  // Load contacts when the component mounts
  useEffect(() => {
    async function loadContacts() {
      try {
        setIsLoadingContacts(true)
        const people = await personService.getPeople()

        const formattedContacts = people.map((person) => ({
          id: person.id,
          name: personService.getDisplayName(person),
          type: person.person_type, // Use person_type from Supabase schema
        }))

        setContacts(formattedContacts)
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

  async function onSubmit(values: AppointmentFormValues) {
    try {
      setIsLoading(true)

      // Format dates for API and map to Supabase column names
      const supabaseAppointmentData: NewAppointment = {
        person_id: values.person_id || null,
        appointment_type: values.appointment_type, // Use appointment_type
        status: values.status as NewAppointment['status'],
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        address: values.address, // Use address
        notes: values.notes,
        opportunity_id: values.opportunity_id || null,
        project_id: values.project_id || null,
        // created_by_user_id is not handled by the form, will be set by Supabase RLS or backend logic
      };

      // Remove undefined values to allow Supabase to use defaults or nulls
      Object.keys(supabaseAppointmentData).forEach(key => {
        if (supabaseAppointmentData[key as keyof NewAppointment] === undefined) {
          delete supabaseAppointmentData[key as keyof NewAppointment];
        }
      });


      if (appointmentId) {
        // Update existing appointment
        await appointmentService.updateAppointment(appointmentId, supabaseAppointmentData as any);
        toast({
          title: "Appointment updated",
          description: "Your appointment has been updated successfully.",
        });
      } else {
        // Create new appointment
        const newAppointment = await appointmentService.createAppointment(supabaseAppointmentData);
        toast({
          title: "Appointment created",
          description: "Your new appointment has been scheduled successfully.",
        });
        router.push(`/appointments/${newAppointment.id}`);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="appointment_type" // Use appointment_type
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel> {/* Keep label as Title for user */}
              <FormControl>
                <Input placeholder="Enter appointment title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description" // Keep form field name as description for user input
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter appointment description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(field.value)
                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
                            field.onChange(newDate)
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 opacity-50" />
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":")
                              const newDate = field.value ? new Date(field.value) : new Date();
                              newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                              field.onChange(newDate)
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date & Time</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP p") : <span>Pick a date and time</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (date) {
                            const newDate = new Date(field.value)
                            newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
                            field.onChange(newDate)
                          }
                        }}
                        initialFocus
                      />
                      <div className="p-3 border-t border-border">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 opacity-50" />
                          <Input
                            type="time"
                            value={field.value ? format(field.value, "HH:mm") : ""}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":")
                              const newDate = field.value ? new Date(field.value) : new Date();
                              newDate.setHours(Number.parseInt(hours), Number.parseInt(minutes))
                              field.onChange(newDate)
                            }}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="address" // Use address
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel> {/* Keep label as Location for user */}
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
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
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Canceled">Canceled</SelectItem>
                      <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                      <SelectItem value="No Show">No Show</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {isLoadingContacts ? (
                      <SelectItem value="loading" disabled>
                        Loading contacts...
                      </SelectItem>
                    ) : (
                      contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name}
                        </SelectItem>
                      ))
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

          {/* Removed assigned_to form field */}
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
              <FormDescription>Internal notes about this appointment.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : appointmentId ? "Update Appointment" : "Schedule Appointment"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
