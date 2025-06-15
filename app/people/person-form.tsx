"use client"

import { useState, useEffect, Dispatch, SetStateAction } from "react" // Import useEffect
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area" // Import ScrollArea and ScrollBar
import { toast } from "@/components/ui/use-toast"
import { personService } from "@/lib/people"
import { PersonType, NewPerson, Person, UpdatePerson } from "@/types/people" // Import types from types/people
import { TagInput } from "@/components/tag-input"

const personSchema = z
  .object({
    person_type: z.enum(["Customer", "Lead", "Business", "Subcontractor", "Employee"]), // Use capitalized values from PersonType
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
    lead_stage: z.string().optional(), // Add lead_stage to schema
    notes: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // For businesses and subcontractors, business_name is required
      if (
        (data.person_type === "Business" || data.person_type === "Subcontractor") &&
        !data.business_name
      ) {
        return false
      }
      // For individuals, at least first_name or last_name is required
      if (
        data.person_type !== "Business" &&
        data.person_type !== "Subcontractor" &&
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
  const [leadSources, setLeadSources] = useState<{ id: string; name: string }[]>([]) // State for lead sources
  const [leadStages, setLeadStages] = useState<{ id: string; name: string }[]>([]) // State for lead stages
  const [loadingCategories, setLoadingCategories] = useState(true) // State for loading categories
  const [errorCategories, setErrorCategories] = useState<string | null>(null) // State for category loading errors
  const [showNewSourceInput, setShowNewSourceInput] = useState(false); // State to show new source input
  const [showNewStageInput, setShowNewStageInput] = useState(false); // State to show new stage input
  const [newSource, setNewSource] = useState(''); // State for new source input value
  const [newStage, setNewStage] = useState(''); // State for new stage input value

  const form = useForm<PersonFormValues>({
    resolver: zodResolver(personSchema),
    defaultValues: initialData
      ? {
          // Convert to lowercase for UI display
          person_type: initialData.person_type as PersonFormValues["person_type"],
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
          lead_stage: initialData.lead_stage || "", // Add lead_stage to defaultValues
          tags: initialData.tags || [],
        }
      : {
          person_type: "Lead", // Default to "Lead" (capitalized)
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
          lead_stage: "", // Add lead_stage to defaultValues
          notes: "",
          tags: [],
        },
  })

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true)
        // Fetch Lead Sources
        const leadSourcesResponse = await fetch('/api/categories?type=lead_source');
        if (!leadSourcesResponse.ok) {
          throw new Error(`Error fetching lead sources: ${leadSourcesResponse.statusText}`);
        }
        const leadSourcesData = await leadSourcesResponse.json();
        setLeadSources(leadSourcesData);

        // Fetch Lead Stages
        const leadStagesResponse = await fetch('/api/categories?type=lead_stage');
        if (!leadStagesResponse.ok) {
          throw new Error(`Error fetching lead stages: ${leadStagesResponse.statusText}`);
        }
        const leadStagesData = await leadStagesResponse.json();
        setLeadStages(leadStagesData);

      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrorCategories(error instanceof Error ? error.message : "An unknown error occurred");
        toast({
          title: "Error fetching categories",
          description: error instanceof Error ? error.message : "An error occurred while loading categories.",
          variant: "destructive",
        });
      } finally {
        setLoadingCategories(false);
      }
    }

    fetchCategories();
  }, []); // Empty dependency array means this effect runs once on mount


  const personType = form.watch("person_type")
  const isBusinessOrSubcontractor = personType === "Business" || personType === "Subcontractor"

  async function onSubmit(values: PersonFormValues) {
    setIsSubmitting(true)
    try {
      console.log("Submitting form with values:", values)

      // Ensure person_type is capitalized for the service
      const submissionValues = {
        ...values,
        person_type: values.person_type.charAt(0).toUpperCase() + values.person_type.slice(1),
      };

      if (isEdit && initialData) {
        await personService.updatePerson(initialData.id, submissionValues as UpdatePerson)
        toast({
          title: "Contact updated",
          description: "The contact has been updated successfully.",
        })
      } else {
        await personService.createPerson(submissionValues as NewPerson)
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

  async function handleAddCategory(
    type: 'lead_source' | 'lead_stage',
    name: string,
    setCategories: Dispatch<SetStateAction<{ id: string; name: string }[]>>,
    setNewCategory: Dispatch<SetStateAction<string>>,
    setShowNewInput: Dispatch<SetStateAction<boolean>>
  ) {
    if (!name.trim()) {
      toast({
        title: "Input required",
        description: "Please enter a name for the new category.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true); // Disable form while adding category
    try {
      const response = await fetch(`/api/categories?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(`Error adding category: ${response.statusText}`);
      }

      const newCategory = await response.json();
      setCategories(prevCategories => [...prevCategories, newCategory]);
      setNewCategory('');
      setShowNewInput(false);
      toast({
        title: "Category added",
        description: `New ${type.replace('_', ' ')} "${newCategory.name}" added.`,
      });

      // Optionally, set the newly added category as the selected value
      if (type === 'lead_source') {
        form.setValue('lead_source', newCategory.name);
      } else if (type === 'lead_stage') {
        form.setValue('lead_stage', newCategory.name);
      }

    } catch (error) {
      console.error(`Error adding ${type}:`, error);
      toast({
        title: "Error adding category",
        description: error instanceof Error ? error.message : "An error occurred while adding the category.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  }

  console.log("Form errors:", form.formState.errors); // Debugging line

  return (
    <Form {...form}>
      <ScrollArea className="h-[calc(100vh-8rem)] px-4"> {/* Adjust height as needed */}
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          toast({
            title: "Validation Error",
            description: "Please check the form for errors.",
            variant: "destructive",
          });
        })} className="space-y-6 py-4">
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
                  <Select onValueChange={(value) => {
                    if (value === "add_new_source") {
                      setShowNewSourceInput(true);
                    } else {
                      field.onChange(value);
                      setShowNewSourceInput(false);
                    }
                  }} defaultValue={field.value} disabled={isSubmitting || loadingCategories}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCategories ? "Loading sources..." : "Select a lead source"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {errorCategories ? (
                        <SelectItem value="error" disabled>Error loading sources</SelectItem>
                      ) : (
                        leadSources.map((source) => (
                          <SelectItem key={source.id} value={source.name}>
                            {source.name}
                          </SelectItem>
                        ))
                      )}
                      <SelectItem value="add_new_source">Add New Source</SelectItem>
                    </SelectContent>
                  </Select>
                  {showNewSourceInput && (
                    <div className="flex space-x-2 mt-2">
                      <Input
                        placeholder="New source name"
                        value={newSource}
                        onChange={(e) => setNewSource(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <Button type="button" onClick={() => handleAddCategory('lead_source', newSource, setLeadSources, setNewSource, setShowNewSourceInput)} disabled={isSubmitting || !newSource}>
                        Add
                      </Button>
                    </div>
                  )}
                  <FormDescription>Where this contact came from (optional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Add Lead Stage field */}
            {personType === "Lead" && (
              <FormField
                control={form.control}
                name="lead_stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lead Stage</FormLabel>
                    <Select onValueChange={(value) => {
                      if (value === "add_new_stage") {
                        setShowNewStageInput(true);
                      } else {
                        field.onChange(value);
                        setShowNewStageInput(false);
                      }
                    }} defaultValue={field.value} disabled={isSubmitting || loadingCategories}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingCategories ? "Loading stages..." : "Select a lead stage"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {errorCategories ? (
                          <SelectItem value="error" disabled>Error loading stages</SelectItem>
                        ) : (
                          leadStages.map((stage) => (
                            <SelectItem key={stage.id} value={stage.name}>
                            {stage.name}
                          </SelectItem>
                          ))
                        )}
                        <SelectItem value="add_new_stage">Add New Stage</SelectItem>
                      </SelectContent>
                    </Select>
                    {showNewStageInput && (
                      <div className="flex space-x-2 mt-2">
                        <Input
                          placeholder="New stage name"
                          value={newStage}
                          onChange={(e) => setNewStage(e.target.value)}
                          disabled={isSubmitting}
                        />
                        <Button type="button" onClick={() => handleAddCategory('lead_stage', newStage, setLeadStages, setNewStage, setShowNewStageInput)} disabled={isSubmitting || !newStage}>
                          Add
                        </Button>
                      </div>
                    )}
                    <FormDescription>The current stage of this lead (optional).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
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
          <ScrollBar orientation="vertical" />
        </form>
      </ScrollArea>
      <div className="flex justify-end space-x-4 p-4 border-t"> {/* Added padding and border-t */}
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit" // Keep type="submit" for native form submission
          disabled={isSubmitting}
          onClick={() => {
            // This onClick is a fallback to ensure handleSubmit is called,
            // in case the native form submission doesn't trigger it for some reason.
            // It will also trigger validation.
            form.handleSubmit(onSubmit, (errors) => {
              console.error("Form validation errors (fallback onClick):", errors);
              toast({
                title: "Validation Error",
                description: "Please check the form for errors.",
                variant: "destructive",
              });
            })(); // Immediately invoke the returned function
            console.log("Submit button clicked (fallback)!");
          }}
        >
          {isSubmitting ? "Saving..." : isEdit ? "Update Contact" : "Create Contact"}
        </Button>
      </div>
    </Form>
  )
}
