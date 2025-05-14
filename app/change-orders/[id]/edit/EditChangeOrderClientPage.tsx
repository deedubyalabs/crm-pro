"use client"

import { useEffect, useState } from "react"
import { useRouter, notFound } from "next/navigation"
import ChangeOrderForm from "../../change-order-form"
import { getChangeOrderById } from "@/lib/change-orders"
import { personService } from "@/lib/people"
import { projectService } from "@/lib/projects"

interface EditChangeOrderClientPageProps {
  params: {
    id: string
  }
}

export default function EditChangeOrderClientPage({ params }: EditChangeOrderClientPageProps) {
  const router = useRouter()
  const [changeOrder, setChangeOrder] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch change order
        const changeOrderData = await getChangeOrderById(params.id)
        if (!changeOrderData) {
          notFound()
          return
        }
        setChangeOrder(changeOrderData)

        // Fetch projects
        const projectsData = await projectService.getProjects()
        setProjects(projectsData)

        // Fetch people
        const peopleData = await personService.getPeople({ type: "Customer" })
        setPeople(peopleData)
      } catch (error) {
        console.error("Error fetching data:", error)
        notFound()
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  return <ChangeOrderForm projects={projects} people={people} initialData={changeOrder} />
}
