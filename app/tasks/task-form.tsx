"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { taskService } from "@/lib/tasks";
import { personService } from "@/lib/people";
import { projectService } from "@/lib/projects";
import { opportunityService } from "@/lib/opportunities";

import { TaskType, TaskStatus, type Task, type CreateTaskParams, type UpdateTaskParams } from "@/types/tasks";
import { type Person } from "@/types/people";
import { type Project } from "@/types/project";
import { type Opportunity } from "@/types/opportunities";

const formSchema = z.object({
  task_name: z.string().min(2, {
    message: "Task name must be at least 2 characters.",
  }),
  type: z.nativeEnum(TaskType).nullable().optional(),
  opportunity_id: z.string().uuid().nullable().optional(),
  project_id: z.string().uuid().nullable().optional(),
  person_id: z.string().uuid().nullable().optional(),
  start_time: z.date().nullable().optional(),
  end_time: z.date().nullable().optional(),
  status: z.nativeEnum(TaskStatus).nullable().optional(),
  notes: z.string().nullable().optional(),
});

type TaskFormProps = {
  initialData?: Task;
};

export default function TaskForm({ initialData }: TaskFormProps) {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingRelations, setIsLoadingRelations] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      task_name: initialData?.task_name || "",
      type: initialData?.type || null,
      opportunity_id: initialData?.opportunity_id || null,
      project_id: initialData?.project_id || null,
      person_id: initialData?.person_id || null,
      start_time: initialData?.start_time ? new Date(initialData.start_time) : null,
      end_time: initialData?.end_time ? new Date(initialData.end_time) : null,
      status: initialData?.status || null,
      notes: initialData?.notes || null,
    },
  });

  useEffect(() => {
    async function fetchRelations() {
      setIsLoadingRelations(true);
      try {
        const [fetchedPeople, fetchedProjects, fetchedOpportunities] = await Promise.all([
          personService.getPeople(),
          projectService.getProjects(),
          opportunityService.getOpportunities(),
        ]);
        setPeople(fetchedPeople);
        setProjects(fetchedProjects);
        setOpportunities(fetchedOpportunities);
      } catch (error) {
        console.error("Error fetching relations:", error);
        toast({
          title: "Error",
          description: "Failed to load related data for task form.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingRelations(false);
      }
    }
    fetchRelations();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (initialData) {
        const taskData: UpdateTaskParams = {
          task_name: values.task_name,
          type: values.type ?? null,
          opportunity_id: values.opportunity_id ?? null,
          project_id: values.project_id ?? null,
          person_id: values.person_id ?? null,
          start_time: values.start_time ? values.start_time.toISOString() : null,
          end_time: values.end_time ? values.end_time.toISOString() : null,
          status: values.status ?? null,
          notes: values.notes ?? null,
        };
        await taskService.updateTask(initialData.id, taskData);
        toast({
          title: "Success",
          description: "Task updated successfully.",
        });
      } else {
        const taskData: CreateTaskParams = {
          task_name: values.task_name!, // Assert as string, as it's validated by zod.min(2)
          type: values.type ?? null,
          opportunity_id: values.opportunity_id ?? null,
          project_id: values.project_id ?? null,
          person_id: values.person_id ?? null,
          start_time: values.start_time ? values.start_time.toISOString() : null,
          end_time: values.end_time ? values.end_time.toISOString() : null,
          status: values.status ?? null,
          notes: values.notes ?? null,
        };
        await taskService.createTask(taskData);
        toast({
          title: "Success",
          description: "Task created successfully.",
        });
      }
      router.push("/tasks");
      router.refresh();
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description: `Failed to save task. ${error instanceof Error ? error.message : ""}`,
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="task_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Call client for update" {...field} />
              </FormControl>
              <FormDescription>
                The name of the task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TaskType).map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The type of task (e.g., Appointment, Phone Call).
              </FormDescription>
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
              <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(TaskStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                The current status of the task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="start_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
              <FormDescription>
                The start date of the task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="end_time"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
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
              <FormDescription>
                The end date of the task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="person_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Assigned Person</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? people.find((person) => person.id === field.value)?.first_name + " " + people.find((person) => person.id === field.value)?.last_name
                        : "Select person"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search person..." />
                    <CommandEmpty>No person found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {people.map((person) => (
                          <CommandItem
                            value={`${person.first_name} ${person.last_name}`}
                            key={person.id}
                            onSelect={() => {
                              form.setValue("person_id", person.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                person.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {person.first_name} {person.last_name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                The person assigned to this task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="project_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Related Project</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? projects.find((project) => project.id === field.value)?.project_name
                        : "Select project"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search project..." />
                    <CommandEmpty>No project found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {projects.map((project) => (
                          <CommandItem
                            value={project.project_name}
                            key={project.id}
                            onSelect={() => {
                              form.setValue("project_id", project.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                project.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {project.project_name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                The project this task is related to.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="opportunity_id"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Related Opportunity</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? opportunities.find((opportunity) => opportunity.id === field.value)?.opportunity_name
                        : "Select opportunity"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search opportunity..." />
                    <CommandEmpty>No opportunity found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList>
                        {opportunities.map((opportunity) => (
                          <CommandItem
                            value={opportunity.opportunity_name}
                            key={opportunity.id}
                            onSelect={() => {
                              form.setValue("opportunity_id", opportunity.id);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                opportunity.id === field.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {opportunity.opportunity_name}
                          </CommandItem>
                        ))}
                      </CommandList>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                The opportunity this task is related to.
              </FormDescription>
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
                  placeholder="Any additional notes for the task"
                  {...field}
                  value={field.value ?? ""} // Convert null to empty string for textarea
                />
              </FormControl>
              <FormDescription>
                Additional details or notes for the task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Save Task</Button>
      </form>
    </Form>
  );
}
