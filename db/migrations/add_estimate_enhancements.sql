-- Add discount fields to estimates table
ALTER TABLE estimates 
ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
ADD COLUMN IF NOT EXISTS discount_value NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS subtotal_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS deposit_required BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS deposit_percentage NUMERIC(5, 2);

-- Add section_name to estimate_line_items
ALTER TABLE estimate_line_items
ADD COLUMN IF NOT EXISTS section_name TEXT;

-- Create payment schedules table
CREATE TABLE IF NOT EXISTS estimate_payment_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estimate_id UUID NOT NULL REFERENCES estimates(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  percentage NUMERIC(5, 2),
  due_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on estimate_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_estimate_payment_schedules_estimate_id ON estimate_payment_schedules(estimate_id);
