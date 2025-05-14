"use client"

import { useRouter } from "next/navigation"
import InvoiceForm from "../invoice-form"
import { getNextInvoiceNumber } from "@/lib/invoices"
import { projectService } from "@/lib/projects"
import { personService } from "@/lib/people"
import { useState, useEffect } from "react"
import { handleCreateInvoice } from "../actions"

export default function NewInvoiceClientPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectsData = await projectService.getProjects()
        const peopleData = await personService.getPeople()
        const nextInvoiceNumberData = await getNextInvoiceNumber()

        setProjects(projectsData)
        setPeople(peopleData)
        setNextInvoiceNumber(nextInvoiceNumberData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const onSubmit = async (formData: FormData) => {
    const result = await handleCreateInvoice(formData, nextInvoiceNumber)
    if (result.success) {
      router.push("/invoices")
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Invoice</h1>
      <InvoiceForm projects={projects} people={people} onSubmit={onSubmit} />
    </div>
  )
}
