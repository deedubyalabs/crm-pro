"use client"

import Link from "next/link"
import { projectService } from "@/lib/projects"
import { takeoffService } from "@/lib/takeoff-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, Ruler, ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"

export default function TakeoffListPageClient({ params }: { params: { id: string } }) {
  const [project, setProject] = useState<any>(null)
  const [takeoffs, setTakeoffs] = useState<any[]>([])

  useEffect(() => {
    projectService
      .getProjectById(params.id)
      .then((project) => {
        setProject(project)
      })
      .catch(() => {
        setProject(null)
      })

    takeoffService.getTakeoffsForProject(params.id).then((takeoffs) => {
      setTakeoffs(takeoffs)
    })
  }, [params.id])

  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Takeoffs for {project.project_name}</h1>
          <p className="text-muted-foreground">Create and manage takeoffs for this project</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/projects/${params.id}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Project
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/projects/${params.id}/takeoff`}>
              <Plus className="mr-2 h-4 w-4" />
              New Takeoff
            </Link>
          </Button>
        </div>
      </div>

      {takeoffs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ruler className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Takeoffs Yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Create your first takeoff to measure areas and estimate materials for this project.
            </p>
            <Button asChild>
              <Link href={`/projects/${params.id}/takeoff`}>
                <Plus className="mr-2 h-4 w-4" />
                Create Takeoff
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {takeoffs.map((takeoff) => (
            <Card key={takeoff.id}>
              <CardHeader>
                <CardTitle>{takeoff.name}</CardTitle>
                <CardDescription>Created {new Date(takeoff.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {takeoff.description || "No description provided"}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" asChild className="flex-1">
                    <Link href={`/projects/${params.id}/takeoff?takeoffId=${takeoff.id}`}>
                      <Ruler className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="flex-1">
                    <Link
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        // Generate estimate from takeoff
                        takeoffService
                          .generateEstimateFromTakeoff(takeoff.id)
                          .then((estimateId) => {
                            window.location.href = `/estimates/${estimateId}`
                          })
                          .catch((error) => {
                            console.error("Error generating estimate:", error)
                            alert("Failed to generate estimate")
                          })
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Estimate
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
