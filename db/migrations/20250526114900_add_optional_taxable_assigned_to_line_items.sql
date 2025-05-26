-- Add is_optional, is_taxable, and assigned_to_user_id fields to estimate_line_items
ALTER TABLE public.estimate_line_items
ADD COLUMN is_optional BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN is_taxable BOOLEAN NOT NULL DEFAULT TRUE,
ADD COLUMN assigned_to_user_id UUID NULL;

-- Add foreign key constraint for assigned_to_user_id
ALTER TABLE public.estimate_line_items
ADD CONSTRAINT fk_assigned_to_user
FOREIGN KEY (assigned_to_user_id) REFERENCES public.users(id)
ON DELETE SET NULL;
