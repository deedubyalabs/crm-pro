-- Create material_lists table
CREATE TABLE IF NOT EXISTS public.material_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    estimate_id UUID REFERENCES public.estimates(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create material_list_items table
CREATE TABLE IF NOT EXISTS public.material_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_list_id UUID NOT NULL REFERENCES public.material_lists(id) ON DELETE CASCADE,
    cost_item_id UUID REFERENCES public.cost_items(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    base_quantity NUMERIC(10, 2) NOT NULL,
    waste_factor NUMERIC(5, 2) DEFAULT 0,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    unit_cost NUMERIC(10, 2),
    total_cost NUMERIC(10, 2),
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create suppliers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    website VARCHAR(255),
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchase_orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    po_number VARCHAR(50) NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    material_list_id UUID REFERENCES public.material_lists(id) ON DELETE SET NULL,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    issue_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    shipping_address_line1 VARCHAR(255),
    shipping_address_line2 VARCHAR(255),
    shipping_city VARCHAR(100),
    shipping_state_province VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create purchase_order_items table
CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    material_list_item_id UUID REFERENCES public.material_list_items(id) ON DELETE SET NULL,
    cost_item_id UUID REFERENCES public.cost_items(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    total_cost NUMERIC(10, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create delivery_schedules table
CREATE TABLE IF NOT EXISTS public.delivery_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled',
    delivery_window_start TIME,
    delivery_window_end TIME,
    contact_name VARCHAR(255),
    contact_phone VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.material_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all access to authenticated users" ON public.material_lists FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.material_list_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.suppliers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.purchase_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.purchase_order_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow all access to authenticated users" ON public.delivery_schedules FOR ALL TO authenticated USING (true);
