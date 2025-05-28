import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getProjectById } from "@/lib/projects"
import { VoiceNoteList } from "@/components/voice-note-list"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface ProjectVoiceNotesPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProjectVoiceNotesPageProps): Promise<Metadata> {
  try {
    const project = await getProjectById(params.id)
    return {
      title: `Voice Notes - ${project.name} | PROActive ONE`,
      description: `Record and manage voice notes for ${project.name}`,
    }
  } catch (error) {
    return {
      title: "Voice Notes | PROActive ONE",
      description: "Record and manage voice notes",
    }
  }
}

export default async function ProjectVoiceNotesPage({ params }: ProjectVoiceNotesPageProps) {
  try {
    const project = await getProjectById(params.id)

    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/projects/${params.id}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Project
            </Link>
          </Button>
        </div>

        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Voice Notes for {project.name}</h1>
          <p className="text-muted-foreground">Record, transcribe, and manage voice notes for this project</p>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="record">Record New</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <VoiceNoteList
              filters={{ project_id: params.id }}
              emptyMessage="No voice notes for this project yet. Click on 'Record New' to get started."
            />
          </TabsContent>

          <TabsContent value="record" className="mt-6">
            <div className="max-w-md mx-auto">
              <VoiceRecorder projectId={params.id} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  } catch (error) {
    notFound()
  }
}
