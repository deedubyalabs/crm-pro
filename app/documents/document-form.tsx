"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import type { Document, DocumentType, DocumentStatus } from "@/types/documents"
import { documentService } from "@/lib/documents"
import { storageService } from "@/lib/storage-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

// Define the form schema
const formSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
  document_type: z.enum([
    "contract",
    "estimate",
    "invoice",
    "permit",
    "plan",
    "photo",
    "warranty",
    "certificate",
    "other",
  ] as const),
  status: z.enum(["draft", "pending_approval", "approved", "rejected", "expired", "active"] as const),
  project_id: z.string().optional().nullable(),
  job_id: z.string().optional().nullable(),
  person_id: z.string().optional().nullable(),
  opportunity_id: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().nullable(),
  expiry_date: z.date().optional().nullable(),
})

type FormValues = z.infer<typeof formSchema>

interface DocumentFormProps {
  document?: Document
  projects: { id: string; name: string }[]
  jobs: { id: string; name: string }[]
  people: { id: string; name: string }[]
  opportunities: { id: string; title: string }[]
}

export function DocumentForm({ document, projects, jobs, people, opportunities }: DocumentFormProps) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tags, setTags] = useState<string[]>(document?.tags || [])
  const [tagInput, setTagInput] = useState("")

  // Initialize form with default values or existing document values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: document?.name || "",
      description: document?.description || "",
      document_type: (document?.document_type as DocumentType) || "other",
      status: (document?.status as DocumentStatus) || "active",
      project_id: document?.project_id || null,
      job_id: document?.job_id || null,
      person_id: document?.person_id || null,
      opportunity_id: document?.opportunity_id || null,
      tags: document?.tags || [],
      expiry_date: document?.metadata?.expiry_date ? new Date(document.metadata.expiry_date) : null,
    },
  })

  // Update form values when document changes
  useEffect(() => {
    if (document) {
      form.reset({
        name: document.name,
        description: document.description || "",
        document_type: document.document_type as DocumentType,
        status: document.status as DocumentStatus,
        project_id: document.project_id,
        job_id: document.job_id,
        person_id: document.person_id,
        opportunity_id: document.opportunity_id,
        tags: document.tags,
        expiry_date: document.metadata?.expiry_date ? new Date(document.metadata.expiry_date) : null,
      })
      setTags(document.tags || [])
    }
  }, [document, form])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])

      // Auto-fill name if it's empty
      if (!form.getValues("name")) {
        const fileName = e.target.files[0].name.split(".")[0]
        form.setValue("name", fileName)
      }
    }
  }

  // Handle tag input
  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        const newTags = [...tags, tagInput.trim()]
        setTags(newTags)
        form.setValue("tags", newTags)
      }
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove)
    setTags(newTags)
    form.setValue("tags", newTags)
  }

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    try {
      setIsUploading(true)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return 95
          }
          return prev + 5
        })
      }, 200)

      let fileUrl = document?.file_url
      let fileType = document?.file_type
      let fileSize = document?.file_size

      // Upload file if a new one is selected
      if (file) {
        fileUrl = await storageService.uploadFile(file)
        fileType = file.type
        fileSize = file.size
      }

      // Prepare metadata
      const metadata: Record<string, any> = {}
      if (values.expiry_date) {
        metadata.expiry_date = values.expiry_date.toISOString()
      }

      if (document) {
        // Update existing document
        await documentService.updateDocument(document.id, {
          name: values.name,
          description: values.description || null,
          document_type: values.document_type,
          status: values.status,
          project_id: values.project_id || null,
          job_id: values.job_id || null,
          person_id: values.person_id || null,
          opportunity_id: values.opportunity_id || null,
          tags: values.tags,
          metadata,
          ...(file ? { file_url: fileUrl, file_type: fileType, file_size: fileSize } : {}),
        })

        toast({
          title: "Document updated",
          description: "Your document has been updated successfully.",
        })
      } else {
        // Create new document
        if (!file) {
          throw new Error("Please select a file to upload.")
        }

        await documentService.createDocument({
          name: values.name,
          description: values.description || null,
          file_url: fileUrl!,
          file_type: fileType!,
          file_size: fileSize!,
          document_type: values.document_type,
          status: values.status,
          version: 1,
          project_id: values.project_id || null,
          job_id: values.job_id || null,
          person_id: values.person_id || null,
          opportunity_id: values.opportunity_id || null,
          created_by: "current-user", // Replace with actual user ID
          tags: values.tags,
          metadata,
        })

        toast({
          title: "Document uploaded",
          description: "Your document has been uploaded successfully.",
        })
      }

      // Complete progress and redirect
      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        router.push("/documents")
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Error saving document:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save document. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter document name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="document_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="estimate">Estimate</SelectItem>
                    <SelectItem value="invoice">Invoice</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="plan">Plan</SelectItem>
                    <SelectItem value="photo">Photo</SelectItem>
                    <SelectItem value="warranty">Warranty</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter document description" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending_approval">Pending Approval</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expiry_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Expiry Date</FormLabel>
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
                <FormDescription>Set an expiry date for this document if applicable.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="project_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
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
            name="job_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {jobs.map((job) => (
                      <SelectItem key={job.id} value={job.id}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="person_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select contact" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
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
            name="opportunity_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Opportunity</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select opportunity" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {opportunities.map((opportunity) => (
                      <SelectItem key={opportunity.id} value={opportunity.id}>
                        {opportunity.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem>
          <FormLabel>Tags</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <div key={tag} className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 pl-1"
                  onClick={() => removeTag(tag)}
                >
                  &times;
                </Button>
              </div>
            ))}
          </div>
          <Input
            placeholder="Add tags (press Enter to add)"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
          />
          <FormDescription>Add tags to help organize and find your documents.</FormDescription>
        </FormItem>

        <FormItem>
          <FormLabel>File</FormLabel>
          <FormControl>
            <Input type="file" onChange={handleFileChange} disabled={isUploading} />
          </FormControl>
          <FormDescription>
            {document ? "Upload a new file to replace the existing one (optional)" : "Select a file to upload"}
          </FormDescription>
          <FormMessage />
        </FormItem>

        {isUploading && (
          <div className="space-y-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              {uploadProgress < 100 ? `Uploading... ${uploadProgress}%` : "Upload complete!"}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {document ? "Updating..." : "Uploading..."}
              </>
            ) : (
              <>{document ? "Update Document" : "Upload Document"}</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
