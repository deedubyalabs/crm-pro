"use client"

import { redirect, notFound } from "next/navigation"
import InvoiceForm from "../../invoice-form"
import { getInvoiceById, updateInvoice } from "@/lib/invoices"
import { projectService } from "@/lib/projects"
import { personService } from "@/lib/people"
import { useEffect, useState } from "react"

export default function EditInvoiceClientPage({
  params,
}: {
  params: { id: string }
}) {
  const [invoice, setInvoice] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const invoiceData = await getInvoiceById(params.id)
        if (!invoiceData) {
          notFound()
          return
        }
        setInvoice(invoiceData)

        const projectsData = await projectService.getProjects()
        setProjects(projectsData)

        const peopleData = await personService.getPeople()
        setPeople(peopleData)
      } catch (error) {
        console.error("Error fetching data:", error)
        notFound() // Or handle the error as needed
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  async function handleUpdateInvoice(formData: FormData) {
    "use server"

    const project_id = formData.get("project_id") as string
    const person_id = formData.get("person_id") as string
    const invoice_number = formData.get("invoice_number") as string
    const status = formData.get("status") as string
    const issue_date = formData.get("issue_date") as string
    const due_date = formData.get("due_date") as string
    const amount_paid = Number.parseFloat(formData.get("amount_paid") as string) || 0
    const notes = formData.get("notes") as string
    const lineItemsJson = formData.get("lineItems") as string
    const total_amount = Number.parseFloat(formData.get("totalAmount") as string) || 0

    const line_items = JSON.parse(lineItemsJson)

    await updateInvoice(params.id, {
      project_id,
      person_id,
      invoice_number,
      status,
      issue_date: issue_date || undefined,
      due_date: due_date || undefined,
      total_amount,
      amount_paid,
      notes,
      line_items: line_items.map((item: any) => ({
        id: item.id,
        description: item.description || "",
        quantity: item.quantity || 0,
        unit: item.unit || "each",
        unit_price: item.unit_price || 0,
        total: item.total || 0,
        sort_order: item.sort_order || 0,
      })),
    })

    redirect("/invoices")
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Invoice</h1>
      <InvoiceForm invoice={invoice} projects={projects} people={people} onSubmit={handleUpdateInvoice} />
    </div>
  )
}
