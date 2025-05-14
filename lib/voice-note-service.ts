import { createClient } from "@/lib/supabase"
import type {
  VoiceNote,
  VoiceNoteCreateParams,
  VoiceNoteUpdateParams,
  VoiceNoteFilterParams,
} from "@/types/voice-notes"

export async function getVoiceNotes(filters: VoiceNoteFilterParams = {}): Promise<VoiceNote[]> {
  const supabase = createClient()

  let query = supabase.from("voice_notes").select("*").order("created_at", { ascending: false })

  if (filters.project_id) {
    query = query.eq("project_id", filters.project_id)
  }

  if (filters.job_id) {
    query = query.eq("job_id", filters.job_id)
  }

  if (filters.status) {
    query = query.eq("status", filters.status)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching voice notes:", error)
    throw new Error("Failed to fetch voice notes")
  }

  return data as VoiceNote[]
}

export async function getVoiceNoteById(id: string): Promise<VoiceNote> {
  const supabase = createClient()

  const { data, error } = await supabase.from("voice_notes").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching voice note:", error)
    throw new Error("Failed to fetch voice note")
  }

  return data as VoiceNote
}

export async function createVoiceNote(params: VoiceNoteCreateParams): Promise<VoiceNote> {
  const supabase = createClient()

  // First, upload the audio file
  const fileName = `voice-notes/${Date.now()}.webm`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("audio")
    .upload(fileName, params.audio_blob, {
      contentType: "audio/webm",
    })

  if (uploadError) {
    console.error("Error uploading audio:", uploadError)
    throw new Error("Failed to upload audio file")
  }

  // Get the public URL for the uploaded file
  const { data: urlData } = await supabase.storage.from("audio").getPublicUrl(fileName)

  const audioUrl = urlData.publicUrl

  // Create the voice note record
  const { data, error } = await supabase
    .from("voice_notes")
    .insert({
      title: params.title,
      audio_url: audioUrl,
      project_id: params.project_id || null,
      job_id: params.job_id || null,
      duration: params.duration,
      status: "pending",
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating voice note:", error)
    throw new Error("Failed to create voice note")
  }

  return data as VoiceNote
}

export async function updateVoiceNote(params: VoiceNoteUpdateParams): Promise<VoiceNote> {
  const supabase = createClient()

  const updates: Partial<VoiceNote> = {}

  if (params.title) {
    updates.title = params.title
  }

  if (params.transcript) {
    updates.transcript = params.transcript
  }

  if (params.status) {
    updates.status = params.status
  }

  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("voice_notes").update(updates).eq("id", params.id).select().single()

  if (error) {
    console.error("Error updating voice note:", error)
    throw new Error("Failed to update voice note")
  }

  return data as VoiceNote
}

export async function deleteVoiceNote(id: string): Promise<void> {
  const supabase = createClient()

  // First get the voice note to get the audio URL
  const voiceNote = await getVoiceNoteById(id)

  // Extract the file path from the URL
  const audioUrl = new URL(voiceNote.audio_url)
  const filePath = audioUrl.pathname.split("/").slice(-2).join("/")

  // Delete the record
  const { error } = await supabase.from("voice_notes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting voice note:", error)
    throw new Error("Failed to delete voice note")
  }

  // Delete the audio file
  const { error: storageError } = await supabase.storage.from("audio").remove([filePath])

  if (storageError) {
    console.error("Error deleting audio file:", storageError)
    // We don't throw here since the record is already deleted
  }
}

export async function transcribeVoiceNote(id: string): Promise<VoiceNote> {
  // Update status to transcribing
  await updateVoiceNote({
    id,
    status: "transcribing",
  })

  try {
    // Get the voice note
    const voiceNote = await getVoiceNoteById(id)

    // Call the transcription API
    const response = await fetch("/api/voice-notes/transcribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: voiceNote.id, audioUrl: voiceNote.audio_url }),
    })

    if (!response.ok) {
      throw new Error("Transcription failed")
    }

    const result = await response.json()

    // Update the voice note with the transcript
    return await updateVoiceNote({
      id,
      transcript: result.transcript,
      status: "completed",
    })
  } catch (error) {
    console.error("Error transcribing voice note:", error)

    // Update status to error
    await updateVoiceNote({
      id,
      status: "error",
    })

    throw new Error("Failed to transcribe voice note")
  }
}
