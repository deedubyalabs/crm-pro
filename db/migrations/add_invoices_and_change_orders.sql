-- Create invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    person_id UUID NOT NULL REFERENCES public.people(id),
    invoice_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    issue_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    notes TEXT,
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS public.invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create change_orders table
CREATE TABLE IF NOT EXISTS public.change_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id),
    change_order_number VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reason TEXT,
    requested_by VARCHAR(255),
    issue_date TIMESTAMP WITH TIME ZONE,
    approval_date TIMESTAMP WITH TIME ZONE,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    impact_on_timeline INTEGER, -- Number of days added/removed from timeline
    created_by_user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create change_order_line_items table
CREATE TABLE IF NOT EXISTS public.change_order_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    change_order_id UUID NOT NULL REFERENCES public.change_orders(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice status enum
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Void');

-- Create change order status enum
CREATE TYPE change_order_status AS ENUM ('Draft', 'Pending Approval', 'Approved', 'Rejected', 'Implemented', 'Canceled');

-- Add indexes for better performance
CREATE INDEX idx_invoices_project_id ON public.invoices(project_id);
CREATE INDEX idx_invoices_person_id ON public.invoices(person_id);
CREATE INDEX idx_invoice_line_items_invoice_id ON public.invoice_line_items(invoice_id);
CREATE INDEX idx_change_orders_project_id ON public.change_orders(project_id);
CREATE INDEX idx_change_order_line_items_change_order_id ON public.change_order_line_items(change_order_id);
