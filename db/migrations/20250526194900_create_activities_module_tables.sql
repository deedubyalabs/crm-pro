-- Create activity_types table
CREATE TABLE public.activity_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES public.users(id), -- Assuming a 'users' table exists
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Populate with default activity types
INSERT INTO public.activity_types (name, is_default) VALUES
('On-Site Estimate', TRUE),
('Video Chat Estimate', TRUE),
('Phone Call', TRUE),
('Initial Consultation', TRUE),
('Follow-Up', TRUE),
('Client Meeting', TRUE),
('Site Visit (Project)', TRUE),
('Material Pickup/Order', TRUE);

-- Create activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL, -- Consider making this an enum or FK to a lookup table later if needed
    due_date DATE,
    start_time TIME,
    end_time TIME,
    is_all_day BOOLEAN DEFAULT TRUE,
    activity_type UUID REFERENCES public.activity_types(id),
    location TEXT,
    priority TEXT, -- Consider making this an enum or FK to a lookup table later if needed
    linked_person_id UUID REFERENCES public.people(id), -- Assuming a 'people' table exists
    linked_opportunity_id UUID REFERENCES public.opportunities(id), -- Assuming an 'opportunities' table exists
    linked_project_id UUID REFERENCES public.projects(id), -- Assuming a 'projects' table exists
    assigned_to_user_id UUID REFERENCES public.users(id) NOT NULL, -- Assuming a 'users' table exists
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_attendees table
CREATE TABLE public.activity_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (activity_id, person_id) -- Ensure a person can only be an attendee once per activity
);

-- Add RLS policies for new tables (assuming RLS is enabled for other tables)
ALTER TABLE public.activity_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON public.activity_types FOR SELECT USING (TRUE);
CREATE POLICY "Enable insert for authenticated users" ON public.activity_types FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users" ON public.activity_types FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users" ON public.activity_types FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for assigned user" ON public.activities FOR SELECT USING (auth.uid() = assigned_to_user_id);
CREATE POLICY "Enable insert for authenticated users" ON public.activities FOR INSERT WITH CHECK (auth.uid() = assigned_to_user_id);
CREATE POLICY "Enable update for assigned user" ON public.activities FOR UPDATE USING (auth.uid() = assigned_to_user_id);
CREATE POLICY "Enable delete for assigned user" ON public.activities FOR DELETE USING (auth.uid() = assigned_to_user_id);

ALTER TABLE public.activity_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for activity owner or attendee" ON public.activity_attendees FOR SELECT USING (EXISTS (SELECT 1 FROM public.activities WHERE activities.id = activity_id AND activities.assigned_to_user_id = auth.uid()) OR EXISTS (SELECT 1 FROM public.people WHERE people.id = person_id AND people.user_id = auth.uid()));
CREATE POLICY "Enable insert for activity owner" ON public.activity_attendees FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.activities WHERE activities.id = activity_id AND activities.assigned_to_user_id = auth.uid()));
CREATE POLICY "Enable delete for activity owner" ON public.activity_attendees FOR DELETE USING (EXISTS (SELECT 1 FROM public.activities WHERE activities.id = activity_id AND activities.assigned_to_user_id = auth.uid()));
