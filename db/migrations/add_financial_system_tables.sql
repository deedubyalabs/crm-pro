-- Add missing columns to existing tables
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS billed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES public.invoices(id);
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS time_impact_days INTEGER DEFAULT 0;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS cost_impact DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.change_orders ADD COLUMN IF NOT EXISTS co_number VARCHAR(50);

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    person_id UUID REFERENCES public.people(id),
    description TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    expense_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(100),
    receipt_url TEXT,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    billed BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id UUID REFERENCES public.invoices(id),
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    job_id UUID NOT NULL REFERENCES public.jobs(id),
    person_id UUID NOT NULL REFERENCES public.people(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    hours DECIMAL(5, 2) NOT NULL,
    description TEXT,
    billable BOOLEAN NOT NULL DEFAULT TRUE,
    billed BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_id UUID REFERENCES public.invoices(id),
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    person_id UUID NOT NULL REFERENCES public.people(id),
    amount DECIMAL(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    square_payment_id VARCHAR(100),
    square_receipt_url TEXT,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add invoice_type column to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) DEFAULT 'standard';

-- Add source_type and source_id columns to invoice_line_items table
ALTER TABLE public.invoice_line_items ADD COLUMN IF NOT EXISTS source_type VARCHAR(50);
ALTER TABLE public.invoice_line_items ADD COLUMN IF NOT EXISTS source_id UUID;
ALTER TABLE public.invoice_line_items ADD COLUMN IF NOT EXISTS section_title TEXT;
ALTER TABLE public.invoice_line_items ADD COLUMN IF NOT EXISTS is_section_header BOOLEAN DEFAULT FALSE;

-- Create expense_categories table
CREATE TABLE IF NOT EXISTS public.expense_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO public.expense_categories (name, description, is_active)
VALUES 
('Materials', 'Construction materials and supplies', true),
('Equipment', 'Equipment rental or purchase', true),
('Subcontractor', 'Payments to subcontractors', true),
('Permits', 'Building permits and inspections', true),
('Travel', 'Travel expenses related to the project', true),
('Labor', 'Labor costs not tracked through time entries', true),
('Office', 'Office supplies and expenses', true),
('Other', 'Miscellaneous expenses', true)
ON CONFLICT (name) DO NOTHING;

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default payment methods
INSERT INTO public.payment_methods (name, description, is_online, is_active)
VALUES 
('Cash', 'Cash payment', false, true),
('Check', 'Check payment', false, true),
('Credit Card', 'Manual credit card payment', false, true),
('Bank Transfer', 'Direct bank transfer', false, true),
('Square', 'Online payment via Square', true, true),
('Other', 'Other payment method', false, true)
ON CONFLICT (name) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_project_id ON public.expenses(project_id);
CREATE INDEX IF NOT EXISTS idx_expenses_person_id ON public.expenses(person_id);
CREATE INDEX IF NOT EXISTS idx_expenses_invoice_id ON public.expenses(invoice_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON public.time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_person_id ON public.time_entries(person_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_invoice_id ON public.time_entries(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_person_id ON public.payments(person_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_source_id ON public.invoice_line_items(source_id);
