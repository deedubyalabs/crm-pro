import { notFound } from "next/navigation"
import { projectService } from "@/lib/projects"
import TakeoffEditor from "./takeoff-editor"
import TakeoffSkeleton from "./takeoff-skeleton"
import { Suspense } from "react"

export const metadata = {
  title: "Project Takeoff | HomePro One",
  description: "Create and edit project takeoffs",
}

export default async function ProjectTakeoffPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { takeoffId?: string }
}) {
  const project = await projectService.getProjectById(params.id).catch(() => null)

  if (!project) {
    notFound()
  }

  const awaitedSearchParams = await searchParams;
  const takeoffId = awaitedSearchParams.takeoffId

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">
        {takeoffId ? "Edit Takeoff" : "New Takeoff"}: {project.project_name}
      </h1>

      <Suspense fallback={<TakeoffSkeleton />}>
        <TakeoffEditor projectId={project.id} initialTakeoffId={takeoffId} />
      </Suspense>
    </div>
  )
}
