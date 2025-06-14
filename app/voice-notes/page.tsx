import type { Metadata } from "next"
import { Suspense } from "react"
import { VoiceNoteList } from "@/components/voice-note-list"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getVoiceNotes } from "@/lib/voice-note-service"

export const metadata: Metadata = {
  title: "Voice Notes | PROActive ONE",
  description: "Record, transcribe, and manage voice notes",
}

export default async function VoiceNotesPage() {
  const voiceNotes = await getVoiceNotes({})

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Voice Notes</h1>
        <p className="text-muted-foreground">Record, transcribe, and manage voice notes for your projects and jobs</p>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Notes</TabsTrigger>
          <TabsTrigger value="record">Record New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Suspense fallback={
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24 mb-4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between mt-4">
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </div>
              ))}
            </div>
          }>
            <VoiceNoteList
              initialVoiceNotes={voiceNotes}
              emptyMessage="You haven't recorded any voice notes yet. Click on 'Record New' to get started."
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="record" className="mt-6">
          <div className="max-w-md mx-auto">
            <VoiceRecorder />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
