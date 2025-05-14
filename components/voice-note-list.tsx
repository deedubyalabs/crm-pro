"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Play, Trash, FileText, RefreshCw, Check, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { VoiceNote, VoiceNoteFilterParams } from "@/types/voice-notes"
import { getVoiceNotes, deleteVoiceNote, transcribeVoiceNote } from "@/lib/voice-note-service"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface VoiceNoteListProps {
  filters?: VoiceNoteFilterParams
  onSelect?: (voiceNote: VoiceNote) => void
  emptyMessage?: string
}

export function VoiceNoteList({ filters = {}, onSelect, emptyMessage = "No voice notes found" }: VoiceNoteListProps) {
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([])
  const [loading, setLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [processingIds, setProcessingIds] = useState<string[]>([])

  const { toast } = useToast()

  useEffect(() => {
    loadVoiceNotes()
  }, [filters])

  const loadVoiceNotes = async () => {
    setLoading(true)
    try {
      const notes = await getVoiceNotes(filters)
      setVoiceNotes(notes)
    } catch (error) {
      console.error("Error loading voice notes:", error)
      toast({
        title: "Error",
        description: "Failed to load voice notes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = (note: VoiceNote) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.currentTime = 0
    }

    // Create new audio element
    const audio = new Audio(note.audio_url)

    audio.onplay = () => {
      setPlayingId(note.id)
    }

    audio.onended = () => {
      setPlayingId(null)
      setCurrentAudio(null)
    }

    audio.play()
    setCurrentAudio(audio)
  }

  const handleDelete = async () => {
    if (!noteToDelete) return

    try {
      await deleteVoiceNote(noteToDelete)
      setVoiceNotes(voiceNotes.filter((note) => note.id !== noteToDelete))
      toast({
        title: "Deleted",
        description: "Voice note deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting voice note:", error)
      toast({
        title: "Error",
        description: "Failed to delete voice note",
        variant: "destructive",
      })
    } finally {
      setNoteToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const confirmDelete = (id: string) => {
    setNoteToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleTranscribe = async (id: string) => {
    setProcessingIds((prev) => [...prev, id])

    try {
      const updatedNote = await transcribeVoiceNote(id)

      // Update the note in the list
      setVoiceNotes((prev) => prev.map((note) => (note.id === id ? updatedNote : note)))

      toast({
        title: "Transcription Complete",
        description: "Voice note has been transcribed successfully",
      })
    } catch (error) {
      console.error("Error transcribing voice note:", error)
      toast({
        title: "Transcription Failed",
        description: "Failed to transcribe voice note",
        variant: "destructive",
      })
    } finally {
      setProcessingIds((prev) => prev.filter((id_) => id_ !== id))
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "transcribing":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-20" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (voiceNotes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {voiceNotes.map((note) => (
          <Card key={note.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <CardDescription>
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })} • {formatTime(note.duration)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-1">{getStatusIcon(note.status)}</div>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {note.transcript ? (
                <p className="text-sm line-clamp-2">{note.transcript}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {note.status === "transcribing"
                    ? "Transcribing..."
                    : note.status === "error"
                      ? "Transcription failed"
                      : "No transcript available"}
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handlePlay(note)} disabled={playingId === note.id}>
                  <Play className="h-4 w-4 mr-1" />
                  {playingId === note.id ? "Playing" : "Play"}
                </Button>

                {!note.transcript && note.status !== "transcribing" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTranscribe(note.id)}
                    disabled={processingIds.includes(note.id)}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Transcribe
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => confirmDelete(note.id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this voice note and its audio recording. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
