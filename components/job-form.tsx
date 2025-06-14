"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, PlusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "@/components/ui/use-toast"
import apiClient from "@/lib/api-client" // Corrected import
import { CreateJobPayload, UpdateJobPayload, JobChecklistItem } from "@/types/job"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from "react" // Added useEffect import

// Define a type for UI-managed checklist items, including fields not in the Zod schema but needed for logic
type UiChecklistItem = {
  id?: string;
  description: string;
  is_complete?: boolean; // Allow undefined to align with Zod input for .default()
  job_id?: string;
  created_at?: string;
};

const jobFormSchema = z.object({
  name: z.string().min(1, "Job name is required"),
  description: z.string().optional().nullable(),
  status: z.string().min(1, "Status is required"),
  assigned_to: z.string().optional().nullable(), // This is the person ID
  scheduled_start_date: z.date().optional().nullable(),
  scheduled_end_date: z.date().optional().nullable(),
  estimated_hours: z.coerce.number().optional().nullable(),
  priority: z.string().optional().nullable(),
  due_date: z.date().optional().nullable(),
  due_time: z.string().optional().nullable(),
  linked_contact_id: z.string().optional().nullable(),
  linked_opportunity_id: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  checklist_items: z.array(z.object({
    id: z.string().optional(),
    description: z.string().min(1, "Checklist item description is required"),
    is_complete: z.boolean().default(false), // Zod output will be boolean
  })),
})

// Use z.input for TFieldValues to match resolver's input expectation for fields with .default()
// Extend specifically for checklist_items to include job_id and created_at for UI logic
type JobFormSchemaInput = z.input<typeof jobFormSchema>;
type JobFormValues = Omit<JobFormSchemaInput, 'checklist_items'> & {
  checklist_items: UiChecklistItem[];
};


interface JobFormProps {
  projectId: string;
  initialData?: JobFormValues;
  jobId?: string;
  onClose: () => void; // Callback to close the drawer/modal
}

export default function JobForm({ projectId, initialData, jobId, onClose }: JobFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [people, setPeople] = useState<any[]>([]); // State for assigned_to dropdown

  const form = useForm<JobFormValues>({ // TFieldValues is JobFormValues
    resolver: zodResolver(jobFormSchema), // schema expects input, produces output
    defaultValues: {
      ...initialData,
      name: initialData?.name || "",
      description: initialData?.description || null,
      status: initialData?.status || "Pending",
      assigned_to: initialData?.assigned_to || null,
      scheduled_start_date: initialData?.scheduled_start_date ? new Date(initialData.scheduled_start_date) : null,
      scheduled_end_date: initialData?.scheduled_end_date ? new Date(initialData.scheduled_end_date) : null,
      estimated_hours: initialData?.estimated_hours || null,
      priority: initialData?.priority || null,
      due_date: initialData?.due_date ? new Date(initialData.due_date) : null,
      due_time: initialData?.due_time || null,
      linked_contact_id: initialData?.linked_contact_id || null,
      linked_opportunity_id: initialData?.linked_opportunity_id || null,
      tags: initialData?.tags || [],
      // Map initial checklist items to the schema structure for defaultValues
      checklist_items: initialData?.checklist_items?.map(item => ({
        id: item.id,
        description: item.description,
        is_complete: item.is_complete, // Can be undefined here, Zod default handles it
      })) || [],
    },
  });

  // Local state for checklist items, richer than form schema (includes job_id, created_at)
  const [checklistItems, setChecklistItems] = useState<UiChecklistItem[]>(
    initialData?.checklist_items || []
  );

  // Removed problematic useEffect that was overwriting checklistItems state

  // Fetch people for assigned_to dropdown
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const response = await apiClient.get("/api/people");
        if (Array.isArray(response.data)) {
          setPeople(response.data);
        } else {
          console.error("API response for people is not an array:", response.data);
          setPeople([]); // Ensure it's an empty array if data is not valid
        }
      } catch (error) {
        console.error("Failed to fetch people:", error);
        toast({
          title: "Error",
          description: "Failed to load people for assignment.",
          variant: "destructive",
        });
      }
    };
    fetchPeople();
  }, []);

  const handleAddChecklistItem = () => {
    const newItem: UiChecklistItem = { id: uuidv4(), description: "", is_complete: false, job_id: jobId, created_at: new Date().toISOString() };
    const updatedLocalItems = [...checklistItems, newItem];
    setChecklistItems(updatedLocalItems);
    // Update RHF with schema-compliant items
    form.setValue('checklist_items', updatedLocalItems.map(item => ({
      id: item.id,
      description: item.description,
      is_complete: item.is_complete,
    })), { shouldValidate: true, shouldDirty: true });
  };

  const handleUpdateChecklistItem = (index: number, key: keyof UiChecklistItem, value: any) => {
    const updatedLocalItems = checklistItems.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    setChecklistItems(updatedLocalItems);
    // If the updated key is part of the schema, update RHF
    if (key === 'description' || key === 'is_complete' || key === 'id') {
      form.setValue(`checklist_items.${index}.${key}` as any, value, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleRemoveChecklistItem = (index: number) => {
    const updatedLocalItems = checklistItems.filter((_, i) => i !== index);
    setChecklistItems(updatedLocalItems);
    // Update RHF with schema-compliant items
    form.setValue("checklist_items", updatedLocalItems.map(item => ({
      id: item.id,
      description: item.description,
      is_complete: item.is_complete,
    })), { shouldValidate: true, shouldDirty: true });
  };

  async function onSubmit(values: JobFormValues) { // values is JobFormValues (z.input based)
    try {
      setIsLoading(true)

      const payload: CreateJobPayload | UpdateJobPayload = {
        project_id: projectId,
        name: values.name,
        description: values.description,
        status: values.status as any, // Cast to JobStatus enum
        assigned_to: values.assigned_to,
        scheduled_start_date: values.scheduled_start_date ? values.scheduled_start_date.toISOString() : null,
        scheduled_end_date: values.scheduled_end_date ? values.scheduled_end_date.toISOString() : null,
        estimated_hours: values.estimated_hours,
        priority: values.priority,
        due_date: values.due_date ? values.due_date.toISOString() : null,
        due_time: values.due_time,
        linked_contact_id: values.linked_contact_id,
        linked_opportunity_id: values.linked_opportunity_id,
        tags: values.tags,
      };

      let response;
      if (jobId) {
        response = await apiClient.patch(`/api/jobs/${jobId}`, payload); // Changed to patch
      } else {
        response = await apiClient.post("/api/jobs", payload);
      }

      if (response.error) { // Changed to check for error
        throw new Error(response.error);
      }

      // Handle checklist items separately
      if (checklistItems.length > 0) {
        const currentJobId = jobId || (response.data as { id: string })?.id;
        if (currentJobId) {
          for (const item of checklistItems) { // item is UiChecklistItem
            const apiChecklistItemPayload = {
              description: item.description,
              is_complete: item.is_complete ?? false, // Ensure boolean for API
            };
            if (item.id && item.job_id) { // Existing item, check item.job_id
              await apiClient.patch(`/api/jobs/${currentJobId}/checklist-items/${item.id}`, apiChecklistItemPayload);
            } else {
              // Create new item
              await apiClient.post(`/api/jobs/${currentJobId}/checklist-items`, {
                ...apiChecklistItemPayload,
                job_id: currentJobId, // Add job_id for new items
                // created_at is handled by DB or API
              });
            }
          }
        }
      }


      toast({
        title: jobId ? "Job updated" : "Job created",
        description: jobId ? "Your job has been updated successfully." : "Your new job has been created successfully.",
      })

      onClose() // Close the drawer/modal
      router.refresh() // Refresh the parent page
    } catch (error) {
      console.error("Error saving job:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter job name" {...field} />
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
                  placeholder="Enter job description"
                  className="resize-none"
                  {...field}
                  value={field.value ?? ""} // Handle null value
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
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Blocked">Blocked</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {people && people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
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
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter estimated hours"
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
            name="scheduled_start_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Scheduled Start Date</FormLabel>
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
            name="scheduled_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Scheduled End Date</FormLabel>
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
            name="due_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
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
            name="due_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linked_contact_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Contact</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {people && people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.first_name} {person.last_name}
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
            name="linked_opportunity_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Linked Opportunity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an opportunity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* Placeholder for opportunities */}
                    <SelectItem value="opportunity1">Opportunity 1</SelectItem>
                    <SelectItem value="opportunity2">Opportunity 2</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Checklist Items</h3>
          <Separator className="mb-4" />
          <div className="space-y-4">
            {checklistItems.map((item, index) => (
              <div key={item.id || `new-${index}`} className="flex items-center space-x-2">
                <Checkbox
                  checked={item.is_complete ?? false} // Handle undefined
                  onCheckedChange={(checked) => handleUpdateChecklistItem(index, "is_complete", !!checked)}
                />
                <Input
                  placeholder="Checklist item description"
                  value={item.description || ""}
                  onChange={(e) => handleUpdateChecklistItem(index, "description", e.target.value)}
                  className="flex-grow"
                />
                <Button variant="ghost" size="icon" onClick={() => handleRemoveChecklistItem(index)}>
                  <PlusCircle className="h-4 w-4 rotate-45" /> {/* Using PlusCircle and rotating for X icon */}
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleAddChecklistItem}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Checklist Item
            </Button>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : jobId ? "Update Job" : "Create Job"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
