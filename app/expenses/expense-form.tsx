"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import type { Expense } from "@/types/expenses"

const expenseFormSchema = z.object({
  project_id: z.string().optional().nullable(),
  job_id: z.string().optional().nullable(),
  user_id: z.string(),
  category: z.string(),
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0"),
  tax_amount: z.coerce.number().min(0).optional().nullable(),
  date: z.date(),
  receipt_url: z.string().optional().nullable(),
  status: z.string(),
  payment_method: z.string(),
  vendor: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  billable: z.boolean().default(false),
  reimbursable: z.boolean().default(false),
  reimbursed_date: z.date().optional().nullable(),
})

type ExpenseFormValues = z.infer<typeof expenseFormSchema>

interface ExpenseFormProps {
  expense?: Expense
  projects?: { id: string; project_name: string }[]
  jobs?: { id: string; title: string }[]
  users?: { id: string; name: string }[]
  onSubmit: (values: ExpenseFormValues) => Promise<void>
}

export function ExpenseForm({ expense, projects = [], jobs = [], users = [], onSubmit }: ExpenseFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)

  const defaultValues: Partial<ExpenseFormValues> = {
    project_id: expense?.project_id || null,
    job_id: expense?.job_id || null,
    user_id: expense?.user_id || users[0]?.id || "",
    category: expense?.category || "materials",
    description: expense?.description || "",
    amount: expense?.amount || 0,
    tax_amount: expense?.tax_amount || 0,
    date: expense?.date ? new Date(expense.date) : new Date(),
    receipt_url: expense?.receipt_url || null,
    status: expense?.status || "pending",
    payment_method: expense?.payment_method || "credit_card",
    vendor: expense?.vendor || "",
    notes: expense?.notes || "",
    billable: expense?.billable || false,
    reimbursable: expense?.reimbursable || false,
    reimbursed_date: expense?.reimbursed_date ? new Date(expense.reimbursed_date) : null,
  }

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues,
  })

  const handleSubmit = async (values: ExpenseFormValues) => {
    try {
      setIsSubmitting(true)

      // Handle receipt upload if there's a new file
      if (receiptFile) {
        const formData = new FormData()
        formData.append("file", receiptFile)

        const response = await fetch("/api/expenses/upload-receipt", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Failed to upload receipt")
        }

        const { url } = await response.json()
        values.receipt_url = url
      }

      await onSubmit(values)

      toast({
        title: expense ? "Expense updated" : "Expense created",
        description: expense
          ? "Your expense has been updated successfully."
          : "Your expense has been created successfully.",
      })

      router.push("/expenses")
      router.refresh()
    } catch (error) {
      console.error("Error submitting expense:", error)
      toast({
        title: "Error",
        description: `Failed to ${expense ? "update" : "create"} expense. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Expense description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="materials">Materials</SelectItem>
                        <SelectItem value="labor">Labor</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="subcontractor">Subcontractor</SelectItem>
                        <SelectItem value="travel">Travel</SelectItem>
                        <SelectItem value="permits">Permits</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount *</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tax_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ""}
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
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
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor</FormLabel>
                    <FormControl>
                      <Input placeholder="Vendor name" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="credit_card">Credit Card</SelectItem>
                        <SelectItem value="debit_card">Debit Card</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="check">Check</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="company_account">Company Account</SelectItem>
                        <SelectItem value="personal_funds">Personal Funds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="reimbursed">Reimbursed</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "none"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Project</SelectItem>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.project_name}
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
                          <SelectValue placeholder="Select a job (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No Job</SelectItem>
                        {jobs.map((job) => (
                          <SelectItem key={job.id} value={job.id}>
                            {job.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-2">
                <FormLabel>Receipt</FormLabel>
                <div className="mt-2">
                  <Input type="file" accept="image/*,.pdf" onChange={handleReceiptChange} />
                  <FormDescription>Upload a receipt image or PDF (optional)</FormDescription>
                </div>
                {expense?.receipt_url && !receiptFile && (
                  <div className="mt-2">
                    <a
                      href={expense.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View existing receipt
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-4">
                <FormField
                  control={form.control}
                  name="billable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Billable</FormLabel>
                        <FormDescription>This expense can be billed to the client</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reimbursable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Reimbursable</FormLabel>
                        <FormDescription>This expense should be reimbursed to the employee</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {form.watch("reimbursable") && form.watch("status") === "reimbursed" && (
                <FormField
                  control={form.control}
                  name="reimbursed_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Reimbursed Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
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
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional notes about this expense"
                        className="min-h-[100px]"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {expense ? "Update Expense" : "Create Expense"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
