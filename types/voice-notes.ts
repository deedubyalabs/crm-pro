export interface VoiceNote {
  id: string
  user_id: string
  project_id?: string
  job_id?: string
  title: string
  audio_url: string
  transcript?: string
  duration: number
  status: "pending" | "transcribing" | "completed" | "error"
  created_at: string
  updated_at: string
}

export interface VoiceNoteCreateParams {
  title: string
  audio_blob: Blob
  project_id?: string
  job_id?: string
  duration: number
}

export interface VoiceNoteUpdateParams {
  id: string
  title?: string
  transcript?: string
  status?: "pending" | "transcribing" | "completed" | "error"
}

export interface VoiceNoteFilterParams {
  project_id?: string
  job_id?: string
  status?: "pending" | "transcribing" | "completed" | "error"
}
