"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Square, Play, Pause } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { createVoiceNote } from "@/lib/voice-note-service"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  projectId?: string
  jobId?: string
  onRecordingComplete?: (voiceNoteId: string) => void
}

export function VoiceRecorder({ projectId, jobId, onRecordingComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    // Initialize audio element
    if (typeof window !== "undefined") {
      audioRef.current = new Audio()
    }

    return () => {
      // Clean up timer on unmount
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      // Stop recording if component unmounts while recording
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(audioBlob)

        // Create object URL for playback
        if (audioRef.current) {
          const audioUrl = URL.createObjectURL(audioBlob)
          audioRef.current.src = audioUrl
        }

        // Stop all tracks in the stream
        stream.getTracks().forEach((track) => track.stop())
      }

      // Start recording
      mediaRecorder.start(100)
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error) {
      console.error("Error starting recording:", error)
      toast({
        title: "Recording Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }

  const togglePause = () => {
    if (!mediaRecorderRef.current || !isRecording) return

    if (isPaused) {
      // Resume recording
      mediaRecorderRef.current.resume()

      // Resume timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      // Pause recording
      mediaRecorderRef.current.pause()

      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    setIsPaused(!isPaused)
  }

  const playRecording = () => {
    if (audioRef.current) {
      audioRef.current.play()
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async () => {
    if (!audioBlob) {
      toast({
        title: "No Recording",
        description: "Please record audio before saving.",
        variant: "destructive",
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your voice note.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const voiceNote = await createVoiceNote({
        title,
        audio_blob: audioBlob,
        project_id: projectId,
        job_id: jobId,
        duration: recordingTime,
      })

      toast({
        title: "Voice Note Saved",
        description: "Your voice note has been saved successfully.",
      })

      // Reset form
      setTitle("")
      setAudioBlob(null)
      setRecordingTime(0)

      // Notify parent component
      if (onRecordingComplete) {
        onRecordingComplete(voiceNote.id)
      }
    } catch (error) {
      console.error("Error saving voice note:", error)
      toast({
        title: "Save Error",
        description: "Failed to save voice note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{formatTime(recordingTime)}</div>
            <div className="flex gap-2">
              {!isRecording && !audioBlob && (
                <Button onClick={startRecording} variant="default" size="icon">
                  <Mic className="h-4 w-4" />
                </Button>
              )}

              {isRecording && (
                <>
                  <Button onClick={togglePause} variant="outline" size="icon">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  </Button>
                  <Button onClick={stopRecording} variant="destructive" size="icon">
                    <Square className="h-4 w-4" />
                  </Button>
                </>
              )}

              {!isRecording && audioBlob && (
                <Button onClick={playRecording} variant="outline" size="icon">
                  <Play className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {!isRecording && audioBlob && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your voice note"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Voice Note"}
              </Button>
            </div>
          )}

          {isRecording && (
            <div className="text-sm text-muted-foreground">
              {isPaused ? "Recording paused" : "Recording in progress..."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
