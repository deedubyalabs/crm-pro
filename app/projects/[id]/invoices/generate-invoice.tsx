"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { financialService } from "@/lib/financial-service"
import { formatCurrency } from "@/lib/utils"
import { supabase } from "@/lib/supabase-client"

const generateInvoiceSchema = z.object({
  invoiceType: z.enum(["estimate", "changeOrders", "expenses", "timeEntries", "comprehensive"]),
  dueDate: z.date().optional(),
  notes: z.string().optional(),

  // Estimate options
  includeAllItems: z.boolean().optional(),
  depositPercentage: z.coerce.number().min(0).max(100).optional(),

  // Change order options
  selectedChangeOrders: z.array(z.string()).optional(),

  // Expense options
  selectedExpenses: z.array(z.string()).optional(),
  expenseMarkup: z.coerce.number().min(0).max(100).optional(),

  // Time entry options
  selectedTimeEntries: z.array(z.string()).optional(),

  // Comprehensive options
  includeEstimate: z.boolean().optional(),
  includeChangeOrders: z.boolean().optional(),
  includeExpenses: z.boolean().optional(),
  includeTimeEntries: z.boolean().optional(),
})

type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>

export default function GenerateInvoiceForm({ projectId }: { projectId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [projectData, setProjectData] = useState<any>(null)
  const [changeOrders, setChangeOrders] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])

  const form = useForm<GenerateInvoiceFormValues>({
    resolver: zodResolver(generateInvoiceSchema),
    defaultValues: {
      invoiceType: "comprehensive",
      includeEstimate: true,
      includeChangeOrders: true,
      includeExpenses: true,
      includeTimeEntries: true,
      expenseMarkup: 0,
      depositPercentage: 0,
      includeAllItems: true,
      selectedChangeOrders: [],
      selectedExpenses: [],
      selectedTimeEntries: [],
    },
  })

  const watchInvoiceType = form.watch("invoiceType")

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        // Fetch project financial summary
        const summary = await financialService.getProjectFinancialSummary(projectId)
        setProjectData(summary)

        // Fetch unbilled change orders
        const { data: unbilledChangeOrders } = await supabase
          .from("change_orders")
          .select("*")
          .eq("project_id", projectId)
          .eq("status", "Approved")
          .eq("billed", false)

        setChangeOrders(unbilledChangeOrders || [])

        // Fetch unbilled expenses
        const { data: unbilledExpenses } = await supabase
          .from("expenses")
          .select("*")
          .eq("project_id", projectId)
          .eq("billable", true)
          .eq("billed", false)

        setExpenses(unbilledExpenses || [])

        // Fetch unbilled time entries
        const { data: unbilledTimeEntries } = await supabase
          .from("time_entries")
          .select("*, job:jobs(id, name, hourly_rate)")
          .eq("project_id", projectId)
          .eq("billable", true)
          .eq("billed", false)

        setTimeEntries(unbilledTimeEntries || [])
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjectData()
  }, [projectId])

  const onSubmit = async (data: GenerateInvoiceFormValues) => {
    setIsSubmitting(true)
    try {
      let invoiceId: string | null = null

      switch (data.invoiceType) {
        case "estimate":
          invoiceId = await financialService.generateInvoiceFromEstimate(projectId, {
            includeAllItems: data.includeAllItems,
            depositPercentage: data.depositPercentage,
            dueDate: data.dueDate?.toISOString(),
            notes: data.notes,
          })
          break

        case "changeOrders":
          if (data.selectedChangeOrders && data.selectedChangeOrders.length > 0) {
            invoiceId = await financialService.generateInvoiceFromChangeOrders(projectId, data.selectedChangeOrders, {
              dueDate: data.dueDate?.toISOString(),
              notes: data.notes,
            })
          }
          break

        case "expenses":
          if (data.selectedExpenses && data.selectedExpenses.length > 0) {
            invoiceId = await financialService.generateInvoiceFromExpenses(projectId, data.selectedExpenses, {
              markupPercentage: data.expenseMarkup,
              dueDate: data.dueDate?.toISOString(),
              notes: data.notes,
            })
          }
          break

        case "timeEntries":
          if (data.selectedTimeEntries && data.selectedTimeEntries.length > 0) {
            invoiceId = await financialService.generateInvoiceFromTimeEntries(projectId, data.selectedTimeEntries, {
              dueDate: data.dueDate?.toISOString(),
              notes: data.notes,
            })
          }
          break

        case "comprehensive":
          invoiceId = await financialService.generateComprehensiveInvoice(projectId, {
            includeEstimate: data.includeEstimate,
            changeOrderIds: data.includeChangeOrders ? changeOrders.map((co) => co.id) : [],
            expenseIds: data.includeExpenses ? expenses.map((exp) => exp.id) : [],
            timeEntryIds: data.includeTimeEntries ? timeEntries.map((entry) => entry.id) : [],
            dueDate: data.dueDate?.toISOString(),
            notes: data.notes,
          })
          break
      }

      if (invoiceId) {
        router.push(`/invoices/${invoiceId}`)
      }
    } catch (error) {
      console.error("Error generating invoice:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Generate Invoice</CardTitle>
            <CardDescription>
              Create an invoice for this project based on estimates, change orders, expenses, or time entries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="invoiceType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Invoice Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="comprehensive" />
                        </FormControl>
                        <FormLabel className="font-normal">Comprehensive Invoice (Multiple Sources)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="estimate" disabled={!projectData?.estimate} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          From Estimate
                          {!projectData?.estimate && (
                            <span className="ml-2 text-sm text-muted-foreground">(No estimate available)</span>
                          )}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="changeOrders" disabled={changeOrders.length === 0} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          From Change Orders
                          {changeOrders.length === 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">(No unbilled change orders)</span>
                          )}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="expenses" disabled={expenses.length === 0} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          From Expenses
                          {expenses.length === 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">(No unbilled expenses)</span>
                          )}
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="timeEntries" disabled={timeEntries.length === 0} />
                        </FormControl>
                        <FormLabel className="font-normal">
                          From Time Entries
                          {timeEntries.length === 0 && (
                            <span className="ml-2 text-sm text-muted-foreground">(No unbilled time entries)</span>
                          )}
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="mt-6">
              {watchInvoiceType === "comprehensive" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Include in Invoice</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="includeEstimate"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={!projectData?.estimate}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Estimate
                              {projectData?.estimate && (
                                <Badge className="ml-2">{formatCurrency(projectData.estimateTotal)}</Badge>
                              )}
                            </FormLabel>
                            <FormDescription>Include items from the approved estimate</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="includeChangeOrders"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={changeOrders.length === 0}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Change Orders
                              {changeOrders.length > 0 && (
                                <Badge className="ml-2">
                                  {changeOrders.length} (
                                  {formatCurrency(changeOrders.reduce((sum, co) => sum + co.cost_impact, 0))})
                                </Badge>
                              )}
                            </FormLabel>
                            <FormDescription>Include approved change orders</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="includeExpenses"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={expenses.length === 0}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Expenses
                              {expenses.length > 0 && (
                                <Badge className="ml-2">
                                  {expenses.length} (
                                  {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))})
                                </Badge>
                              )}
                            </FormLabel>
                            <FormDescription>Include billable expenses</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="includeTimeEntries"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={timeEntries.length === 0}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Time Entries
                              {timeEntries.length > 0 && (
                                <Badge className="ml-2">
                                  {timeEntries.length} (
                                  {timeEntries.reduce((sum, entry) => sum + entry.hours, 0).toFixed(2)} hrs)
                                </Badge>
                              )}
                            </FormLabel>
                            <FormDescription>Include billable time entries</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {watchInvoiceType === "estimate" && projectData?.estimate && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Estimate Options</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="includeAllItems"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked)
                                if (checked) {
                                  form.setValue("depositPercentage", 0)
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Include All Items</FormLabel>
                            <FormDescription>Include all items from the estimate in the invoice</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="depositPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Deposit Percentage</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              {...field}
                              disabled={form.watch("includeAllItems")}
                              onChange={(e) => {
                                field.onChange(e)
                                if (Number(e.target.value) > 0) {
                                  form.setValue("includeAllItems", false)
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Create a deposit invoice for a percentage of the total estimate
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {watchInvoiceType === "changeOrders" && changeOrders.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Change Orders</h3>
                  <FormField
                    control={form.control}
                    name="selectedChangeOrders"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {changeOrders.map((changeOrder) => (
                            <FormField
                              key={changeOrder.id}
                              control={form.control}
                              name="selectedChangeOrders"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={changeOrder.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(changeOrder.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, changeOrder.id])
                                            : field.onChange(field.value?.filter((value) => value !== changeOrder.id))
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-base">
                                        {changeOrder.co_number}: {changeOrder.description}
                                      </FormLabel>
                                      <FormDescription>
                                        {formatCurrency(changeOrder.cost_impact)} | Impact:{" "}
                                        {changeOrder.time_impact_days} days
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchInvoiceType === "expenses" && expenses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Expenses</h3>
                  <FormField
                    control={form.control}
                    name="expenseMarkup"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expense Markup (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" max="100" step="1" {...field} />
                        </FormControl>
                        <FormDescription>Add a percentage markup to expenses</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="selectedExpenses"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {expenses.map((expense) => (
                            <FormField
                              key={expense.id}
                              control={form.control}
                              name="selectedExpenses"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={expense.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(expense.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, expense.id])
                                            : field.onChange(field.value?.filter((value) => value !== expense.id))
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-base">{expense.description}</FormLabel>
                                      <FormDescription>
                                        {formatCurrency(expense.amount)} | Date:{" "}
                                        {new Date(expense.expense_date).toLocaleDateString()}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {watchInvoiceType === "timeEntries" && timeEntries.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Select Time Entries</h3>
                  <FormField
                    control={form.control}
                    name="selectedTimeEntries"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {timeEntries.map((entry) => (
                            <FormField
                              key={entry.id}
                              control={form.control}
                              name="selectedTimeEntries"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={entry.id}
                                    className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(entry.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, entry.id])
                                            : field.onChange(field.value?.filter((value) => value !== entry.id))
                                        }}
                                      />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel className="text-base">
                                        {entry.job.name}: {entry.description}
                                      </FormLabel>
                                      <FormDescription>
                                        {entry.hours} hours @ ${entry.job.hourly_rate}/hr | Date:{" "}
                                        {new Date(entry.date).toLocaleDateString()}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium">Invoice Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={`w-full pl-3 text-left font-normal ${
                                  !field.value ? "text-muted-foreground" : ""
                                }`}
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
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>When payment is due for this invoice</FormDescription>
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
                        <Textarea
                          placeholder="Enter any additional notes for this invoice"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Invoice
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
