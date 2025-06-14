-- Create the project_values_blueprint_items table
CREATE TABLE project_values_blueprint_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pvb_id UUID REFERENCES project_values_blueprints(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    unit TEXT,
    unit_price NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    is_billed BOOLEAN DEFAULT FALSE,
    invoice_line_item_id UUID, -- Links to invoice_line_items(id)
    linked_estimate_line_item_id UUID, -- Links to estimate_line_items(id)
    linked_change_order_line_item_id UUID, -- Links to change_order_line_items(id)
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
