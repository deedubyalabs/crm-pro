"use client"

import { notFound, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { projectService } from "@/lib/projects" // This will be a client-side fetch or passed as prop
import JobForm from "@/components/jobs/job-form" // Corrected import path
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

export default function NewJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(true) // Drawer is open by default for new job

  useEffect(() => {
    const fetchProject = async () => {
      // In a real app, you might fetch this on the server or pass it as a prop
      // For client component, we'll simulate fetch or assume it's passed
      // For now, we'll just use a placeholder project name
      setProject({ id: params.id, project_name: "Loading Project..." });
      // In a real scenario, you'd fetch the project details here
      // const fetchedProject = await projectService.getProjectById(params.id);
      // if (!fetchedProject) {
      //   notFound(); // This won't work directly in client component, handle redirect
      // }
      // setProject(fetchedProject);
    }
    fetchProject();
  }, [params.id]);

  const handleClose = () => {
    setIsOpen(false)
    router.back() // Navigate back when the drawer is closed
  }

  if (!project) {
    return null; // Or a loading spinner
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Add New Job</SheetTitle>
          <SheetDescription>
            Create a new job for project "{project.project_name}".
          </SheetDescription>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-4">
          <JobForm projectId={project.id} onClose={handleClose} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
