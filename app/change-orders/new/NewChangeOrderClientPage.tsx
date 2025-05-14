"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import ChangeOrderForm from "../change-order-form"
import { personService } from "@/lib/people"
import { projectService } from "@/lib/projects"

interface NewChangeOrderClientPageProps {
  projectId?: string
}

export default function NewChangeOrderClientPage({ projectId }: NewChangeOrderClientPageProps) {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch projects
        const projectsData = await projectService.getProjects()
        setProjects(projectsData)

        // Fetch people
        const peopleData = await personService.getPeople({ type: "Customer" })
        setPeople(peopleData)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div className="p-8 text-center">Loading...</div>
  }

  const initialData = projectId ? { project_id: projectId } : undefined

  return <ChangeOrderForm projects={projects} people={people} initialData={initialData} />
}
