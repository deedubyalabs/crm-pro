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
import { type NewTask, taskService } from "@/lib/tasks"
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"

const taskFormSchema = z.object({
  appointment_type: z.string().min(1, "Task type is required"),
  description: z.string().optional(),
  start_time: z.date({
    required_error: "Start time is required",
  }),
  end_time: z.date({
    required_error: "End time is required",
  }),
  address: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  person_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  initialData?: NewTask
  taskId?: string
}

export default function TaskForm({ initialData, taskId }: TaskFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [taskTypes, setTaskTypes] = useState<{ id: string; name: string }[]>([])
  const [isLoadingTaskTypes, setIsLoadingTaskTypes] = useState(true)
  const [showNewTaskTypeInput, setShowNewTaskTypeInput] = useState(false)
  const [newTaskType, setNewTaskType] = useState('')

  const now = new Date()
  const oneHourLater = addHours(now, 1)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
import { type NewTask, taskService } from "@/lib/tasks"
import { Constants } from "@/types/supabase"
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"

const taskFormSchema = z.object({
  activity_type: z.enum(Constants.public.Enums.task_type),
  description: z.string().optional(),
  start_time: z.date({
    required_error: "Start time is required",
  }),
  end_time: z.date({
    required_error: "End time is required",
  }),
  location: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  person_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  initialData?: NewTask
  taskId?: string
}

export default function TaskForm({ initialData, taskId }: TaskFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)

  const now = new Date()
  const oneHourLater = addHours(now, 1)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      activity_type: initialData?.activity_type || Constants.public.Enums.task_type[0],
      description: initialData?.description || "",
      start_time: initialData?.start_time ? new Date(initialData.start_time) : now,
      end_time: initialData?.end_time ? new Date(initialData.end_time) : oneHourLater,
      location: initialData?.location || "",
      status: initialData?.status || "Scheduled",
      person_id: initialData?.linked_person_id || undefined,
      opportunity_id: initialData?.linked_opportunity_id || undefined,
      project_id: initialData?.linked_project_id || undefined,
      notes: initialData?.description || "",
    },
  })

  useEffect(() => {
    async function loadContacts() {
      setIsLoadingContacts(true)
      try {
        const people = await personService.getPeople()
        setContacts(people.map((person) => ({
          id: person.id,
          name: personService.getDisplayName(person),
          type: person.person_type,
        })))
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

  async function onSubmit(values: TaskFormValues) {
    try {
      setIsLoading(true)

      const supabaseTaskData: NewTask = {
        linked_person_id: values.person_id || null,
        activity_type: values.activity_type,
        status: values.status as NewTask['status'],
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        location: values.location,
        description: values.description,
        linked_opportunity_id: values.opportunity_id || null,
        linked_project_id: values.project_id || null,
      };

      Object.keys(supabaseTaskData).forEach(key => {
        if (supabaseTaskData[key as keyof NewTask] === undefined) {
          delete supabaseTaskData[key as keyof NewTask];
        }
      });

      if (taskId) {
        await taskService.updateTask(taskId, supabaseTaskData as any);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        const newTask = await taskService.createTask(supabaseTaskData);
        toast({
          title: "Task created",
          description: "Your new task has been scheduled successfully.",
        });
        router.push(`/tasks/${newTask.id}`);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save task",
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
          name="activity_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Constants.public.Enums.task_type.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" className="resize-none" {...field} />
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
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
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
              <FormDescription>Internal notes about this task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : taskId ? "Update Task" : "Schedule Task"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
import { type NewTask, taskService } from "@/lib/tasks"
import { Constants } from "@/types/supabase"
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"

const taskFormSchema = z.object({
  appointment_type: z.string().min(1, "Task type is required"),
  description: z.string().optional(),
  start_time: z.date({
    required_error: "Start time is required",
  }),
  end_time: z.date({
    required_error: "End time is required",
  }),
  address: z.string().optional(),
  status: z.string().min(1, "Status is required"),
  person_id: z.string().optional(),
  opportunity_id: z.string().optional(),
  project_id: z.string().optional(),
  notes: z.string().optional(),
})

type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  initialData?: NewTask
  taskId?: string
}

export default function TaskForm({ initialData, taskId }: TaskFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [contacts, setContacts] = useState<{ id: string; name: string; type: string }[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(false)
  const [taskTypes, setTaskTypes] = useState<{ id: string; name: string }[]>([])
  const [isLoadingTaskTypes, setIsLoadingTaskTypes] = useState(true)
  const [showNewTaskTypeInput, setShowNewTaskTypeInput] = useState(false)
  const [newTaskType, setNewTaskType] = useState('')

  const now = new Date()
  const oneHourLater = addHours(now, 1)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      appointment_type: initialData?.appointment_type || "",
      description: initialData?.notes || "",
      start_time: initialData?.start_time ? new Date(initialData.start_time) : now,
      end_time: initialData?.end_time ? new Date(initialData.end_time) : oneHourLater,
      address: initialData?.address || "",
      status: initialData?.status || "Scheduled",
      person_id: initialData?.person_id || undefined,
      opportunity_id: initialData?.opportunity_id || undefined,
      project_id: initialData?.project_id || undefined,
      notes: initialData?.notes || "",
    },
  })

  useEffect(() => {
    async function loadInitialData() {
      setIsLoadingContacts(true)
      setIsLoadingTaskTypes(true)
      try {
        const [people, types] = await Promise.all([
          personService.getPeople(),
          taskService.getTaskTypes()
        ])

        setContacts(people.map((person) => ({
          id: person.id,
          name: personService.getDisplayName(person),
          type: person.person_type,
        })))
        setTaskTypes(types)
      } catch (error) {
        console.error("Failed to load initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoadingContacts(false)
        setIsLoadingTaskTypes(false)
      }
    }

    loadInitialData()
  }, [])

  async function handleAddTaskType() {
    if (!newTaskType.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a name for the new task type.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newType = await taskService.createTaskType(newTaskType);
      setTaskTypes(prevTypes => [...prevTypes, newType]);
      setNewTaskType('');
      setShowNewTaskTypeInput(false);
      form.setValue('appointment_type', newType.name);
      toast({
        title: "Task Type Added",
        description: `New task type "${newType.name}" added.`,
      });
    } catch (error) {
      console.error("Error adding task type:", error);
      toast({
        title: "Error adding task type",
        description: error instanceof Error ? error.message : "An error occurred while adding the task type.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(values: TaskFormValues) {
    try {
      setIsLoading(true)

      const supabaseTaskData: NewTask = {
        person_id: values.person_id || null,
        activity_type: values.appointment_type, // Map to activity_type
        status: values.status as NewTask['status'],
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        location: values.address, // Map to location
        description: values.notes, // Map to description
        opportunity_id: values.opportunity_id || null,
        project_id: values.project_id || null,
      };

      Object.keys(supabaseTaskData).forEach(key => {
        if (supabaseTaskData[key as keyof NewTask] === undefined) {
          delete supabaseTaskData[key as keyof NewTask];
        }
      });

      if (taskId) {
        await taskService.updateTask(taskId, supabaseTaskData as any);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        const newTask = await taskService.createTask(supabaseTaskData);
        toast({
          title: "Task created",
          description: "Your new task has been scheduled successfully.",
        });
        router.push(`/tasks/${newTask.id}`);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save task",
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
          name="appointment_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={(value) => {
                if (value === "add_new_type") {
                  setShowNewTaskTypeInput(true);
                } else {
                  field.onChange(value);
                  setShowNewTaskTypeInput(false);
                }
              }} defaultValue={field.value} disabled={isLoading || isLoadingTaskTypes}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingTaskTypes ? "Loading types..." : "Select a task type"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taskTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      {type.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="add_new_type">Add New Type</SelectItem>
                </SelectContent>
              </Select>
              {showNewTaskTypeInput && (
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="New task type name"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button type="button" onClick={handleAddTaskType} disabled={isLoading || !newTaskType}>
                    Add
                  </Button>
                </div>
              )}
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
                <Textarea placeholder="Enter task description" className="resize-none" {...field} />
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
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
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
              <FormDescription>Internal notes about this task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : taskId ? "Update Task" : "Schedule Task"}
          </Button>
        </div>
      </form>
    </Form>
  )
