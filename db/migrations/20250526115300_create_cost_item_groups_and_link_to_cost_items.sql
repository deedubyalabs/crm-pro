-- Create cost_item_groups table
CREATE TABLE public.cost_item_groups (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    description text NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cost_item_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.cost_item_groups
FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.cost_item_groups
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.cost_item_groups
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.cost_item_groups
FOR DELETE USING (auth.role() = 'authenticated');

-- Add cost_item_group_id to cost_items table
ALTER TABLE public.cost_items
ADD COLUMN cost_item_group_id UUID NULL;

-- Add foreign key constraint for cost_item_group_id
ALTER TABLE public.cost_items
ADD CONSTRAINT fk_cost_item_group
FOREIGN KEY (cost_item_group_id) REFERENCES public.cost_item_groups(id)
ON DELETE SET NULL;
