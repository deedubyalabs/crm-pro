-- Create client portal users table
CREATE TABLE IF NOT EXISTS public.client_portal_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client portal sessions table
CREATE TABLE IF NOT EXISTS public.client_portal_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.client_portal_users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT,
    user_agent TEXT
);

-- Create client portal invitations table
CREATE TABLE IF NOT EXISTS public.client_portal_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(customer_id, email)
);

-- Create client portal notifications table
CREATE TABLE IF NOT EXISTS public.client_portal_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.client_portal_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create client portal activities table
CREATE TABLE IF NOT EXISTS public.client_portal_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.client_portal_users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address TEXT
);

-- Create client portal settings table
CREATE TABLE IF NOT EXISTS public.client_portal_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL UNIQUE,
    portal_name TEXT NOT NULL DEFAULT 'Client Portal',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#4f46e5',
    enable_payments BOOLEAN DEFAULT TRUE,
    enable_messaging BOOLEAN DEFAULT TRUE,
    enable_document_signing BOOLEAN DEFAULT TRUE,
    enable_project_updates BOOLEAN DEFAULT TRUE,
    terms_and_conditions TEXT,
    privacy_policy TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_portal_users_customer_id ON public.client_portal_users(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_users_email ON public.client_portal_users(email);
CREATE INDEX IF NOT EXISTS idx_client_portal_sessions_user_id ON public.client_portal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_sessions_token ON public.client_portal_sessions(token);
CREATE INDEX IF NOT EXISTS idx_client_portal_invitations_customer_id ON public.client_portal_invitations(customer_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_invitations_email ON public.client_portal_invitations(email);
CREATE INDEX IF NOT EXISTS idx_client_portal_invitations_token ON public.client_portal_invitations(token);
CREATE INDEX IF NOT EXISTS idx_client_portal_notifications_user_id ON public.client_portal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_notifications_is_read ON public.client_portal_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_client_portal_activities_user_id ON public.client_portal_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_client_portal_activities_created_at ON public.client_portal_activities(created_at);

-- Add RLS policies
ALTER TABLE public.client_portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_portal_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view their own client portal data" 
ON public.client_portal_users FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Users can view their own notifications" 
ON public.client_portal_notifications FOR SELECT 
USING (user_id = auth.uid());

-- Add customer_projects junction table for client portal access
CREATE TABLE IF NOT EXISTS public.customer_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(customer_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_projects_customer_id ON public.customer_projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_projects_project_id ON public.customer_projects(project_id);
