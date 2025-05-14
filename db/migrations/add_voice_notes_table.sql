-- Create voice_notes table
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  transcript TEXT,
  duration INTEGER NOT NULL, -- Duration in seconds
  status TEXT NOT NULL DEFAULT 'pending', -- pending, transcribing, completed, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS voice_notes_user_id_idx ON voice_notes(user_id);
CREATE INDEX IF NOT EXISTS voice_notes_project_id_idx ON voice_notes(project_id);
CREATE INDEX IF NOT EXISTS voice_notes_job_id_idx ON voice_notes(job_id);

-- Add RLS policies
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own voice notes"
  ON voice_notes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own voice notes"
  ON voice_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own voice notes"
  ON voice_notes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own voice notes"
  ON voice_notes FOR DELETE
  USING (auth.uid() = user_id);
