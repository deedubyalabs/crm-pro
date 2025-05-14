import type { Metadata } from "next"
import { VoiceNoteList } from "@/components/voice-note-list"
import { VoiceRecorder } from "@/components/voice-recorder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "Voice Notes | HomePro OS",
  description: "Record, transcribe, and manage voice notes",
}

export default function VoiceNotesPage() {
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
          <VoiceNoteList emptyMessage="You haven't recorded any voice notes yet. Click on 'Record New' to get started." />
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
