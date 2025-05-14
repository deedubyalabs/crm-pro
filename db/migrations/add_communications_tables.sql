-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    archived_at TIMESTAMP WITH TIME ZONE,
    last_message_at TIMESTAMP WITH TIME ZONE
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    content TEXT,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'chat', 'call', 'video')),
    status TEXT NOT NULL CHECK (status IN ('sent', 'delivered', 'read', 'failed', 'draft')),
    priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create message attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversation participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('customer', 'team_member', 'system')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE,
    CONSTRAINT participant_user_or_customer CHECK (
        (user_id IS NOT NULL AND customer_id IS NULL) OR
        (user_id IS NULL AND customer_id IS NOT NULL)
    )
);

-- Create calls table
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    caller_id UUID,
    caller_type TEXT CHECK (caller_type IN ('customer', 'team_member')),
    recipient_id UUID,
    recipient_type TEXT CHECK (recipient_type IN ('customer', 'team_member')),
    status TEXT NOT NULL CHECK (status IN ('missed', 'answered', 'voicemail', 'scheduled', 'in_progress')),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create call recordings table
CREATE TABLE IF NOT EXISTS public.call_recordings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID NOT NULL REFERENCES public.calls(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    duration INTEGER NOT NULL,
    transcription TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create video sessions table
CREATE TABLE IF NOT EXISTS public.video_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    recording_path TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email integrations table
CREATE TABLE IF NOT EXISTS public.email_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    email_address TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email_address)
);

-- Create SMS integrations table
CREATE TABLE IF NOT EXISTS public.sms_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    access_token TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, phone_number)
);

-- Create communication templates table
CREATE TABLE IF NOT EXISTS public.communication_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'chat')),
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON public.messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_customer_id ON public.conversation_participants(customer_id);
CREATE INDEX IF NOT EXISTS idx_calls_conversation_id ON public.calls(conversation_id);
CREATE INDEX IF NOT EXISTS idx_video_sessions_conversation_id ON public.video_sessions(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON public.conversations(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

-- Add RLS policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view conversations they participate in" 
ON public.conversations FOR SELECT 
USING (
    id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can view messages in conversations they participate in" 
ON public.messages FOR SELECT 
USING (
    conversation_id IN (
        SELECT conversation_id FROM public.conversation_participants 
        WHERE user_id = auth.uid()
    )
);

-- Create triggers to update conversation last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.sent_at, updated_at = NOW()
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp
AFTER INSERT OR UPDATE ON public.messages
FOR EACH ROW
WHEN (NEW.sent_at IS NOT NULL)
EXECUTE FUNCTION update_conversation_last_message_timestamp();
