"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Save, ArrowLeft } from "lucide-react"
import type { InvoiceWithDetails, InvoiceLineItem } from "@/types/invoices"
import InvoiceLineItemComponent from "./invoice-line-item"
import { formatCurrency } from "@/lib/utils"

interface Project {
  id: string
  project_name: string
  person_id: string
}

interface Person {
  id: string
  first_name: string | null
  last_name: string | null
  business_name: string | null
}

interface InvoiceFormProps {
  invoice?: InvoiceWithDetails
  projects: Project[]
  people: Person[]
  onSubmit: (formData: FormData) => Promise<void>
}

export default function InvoiceForm({ invoice, projects, people, onSubmit }: InvoiceFormProps) {
  const router = useRouter()
  const [selectedProjectId, setSelectedProjectId] = useState<string>(invoice?.project_id || "")
  const [selectedPersonId, setSelectedPersonId] = useState<string>(invoice?.person_id || "")
  const [lineItems, setLineItems] = useState<Partial<InvoiceLineItem>[]>(
    invoice?.line_items || [{ description: "", quantity: 1, unit: "each", unit_price: 0, total: 0 }],
  )
  const [totalAmount, setTotalAmount] = useState<number>(invoice?.total_amount || 0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update person when project changes
  useEffect(() => {
    if (selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId)
      if (project) {
        setSelectedPersonId(project.person_id)
      }
    }
  }, [selectedProjectId, projects])

  // Calculate total amount when line items change
  useEffect(() => {
    const total = lineItems.reduce((sum, item) => sum + (item.total || 0), 0)
    setTotalAmount(total)
  }, [lineItems])

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit: "each", unit_price: 0, total: 0 }])
  }

  const handleLineItemChange = (index: number, updatedItem: Partial<InvoiceLineItem>) => {
    const newLineItems = [...lineItems]
    newLineItems[index] = updatedItem
    setLineItems(newLineItems)
  }

  const handleRemoveLineItem = (index: number) => {
    const newLineItems = [...lineItems]
    newLineItems.splice(index, 1)
    setLineItems(newLineItems)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const form = e.currentTarget
    const formData = new FormData(form)

    // Add line items to form data
    formData.append("lineItems", JSON.stringify(lineItems))
    formData.append("totalAmount", totalAmount.toString())

    try {
      await onSubmit(formData)
      router.push("/invoices")
    } catch (error) {
      console.error("Error submitting form:", error)
      setIsSubmitting(false)
    }
  }

  const getPersonName = (person: Person) => {
    if (person.business_name) {
      return person.business_name
    }
    return `${person.first_name || ""} ${person.last_name || ""}`.trim()
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_number">Invoice Number</Label>
                <Input
                  id="invoice_number"
                  name="invoice_number"
                  defaultValue={invoice?.invoice_number || ""}
                  placeholder="Will be generated if left blank"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project_id">Project</Label>
                <Select name="project_id" value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.project_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="person_id">Client</Label>
                <Select name="person_id" value={selectedPersonId} onValueChange={setSelectedPersonId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {people.map((person) => (
                      <SelectItem key={person.id} value={person.id}>
                        {getPersonName(person)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue={invoice?.status || "Draft"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                    <SelectItem value="Void">Void</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <Input
                    id="issue_date"
                    name="issue_date"
                    type="date"
                    defaultValue={
                      invoice?.issue_date
                        ? new Date(invoice.issue_date).toISOString().split("T")[0]
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    name="due_date"
                    type="date"
                    defaultValue={invoice?.due_date ? new Date(invoice.due_date).toISOString().split("T")[0] : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_paid">Amount Paid</Label>
                <Input
                  id="amount_paid"
                  name="amount_paid"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={invoice?.amount_paid || 0}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  defaultValue={invoice?.notes || ""}
                  placeholder="Enter any additional notes..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Line Items</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLineItem}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                  <div className="col-span-5 sm:col-span-6">Description</div>
                  <div className="col-span-2 sm:col-span-1">Qty</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Price</div>
                  <div className="col-span-2 sm:col-span-1 text-right pr-2">Total</div>
                  <div className="col-span-1"></div>
                </div>

                {lineItems.map((item, index) => (
                  <InvoiceLineItemComponent
                    key={index}
                    lineItem={item}
                    onChange={(updatedItem) => handleLineItemChange(index, updatedItem)}
                    onRemove={() => handleRemoveLineItem(index)}
                    index={index}
                  />
                ))}

                {lineItems.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No items added yet. Click "Add Item" to add a line item.
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <div className="font-semibold">Total</div>
              <div className="font-semibold">{formatCurrency(totalAmount)}</div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
