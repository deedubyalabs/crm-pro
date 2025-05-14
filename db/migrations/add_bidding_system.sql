-- Create bid_requests table
CREATE TABLE IF NOT EXISTS bid_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  estimate_id UUID REFERENCES estimates(id) ON DELETE SET NULL,
  change_order_id UUID REFERENCES change_orders(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trade_category VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  due_date TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  awarded_at TIMESTAMP WITH TIME ZONE,
  awarded_to UUID,
  notes TEXT,
  CONSTRAINT bid_requests_source_check CHECK (
    (estimate_id IS NOT NULL AND change_order_id IS NULL) OR
    (estimate_id IS NULL AND change_order_id IS NOT NULL) OR
    (estimate_id IS NULL AND change_order_id IS NULL)
  )
);

-- Create bid_items table
CREATE TABLE IF NOT EXISTS bid_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
  estimate_line_item_id UUID REFERENCES estimate_line_items(id) ON DELETE SET NULL,
  change_order_line_item_id UUID REFERENCES change_order_line_items(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  estimated_cost NUMERIC(10, 2),
  estimated_total NUMERIC(10, 2),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT bid_items_source_check CHECK (
    (estimate_line_item_id IS NOT NULL AND change_order_line_item_id IS NULL) OR
    (estimate_line_item_id IS NULL AND change_order_line_item_id IS NOT NULL) OR
    (estimate_line_item_id IS NULL AND change_order_line_item_id IS NULL)
  )
);

-- Create bid_subcontractors table (junction table for bid requests and subcontractors)
CREATE TABLE IF NOT EXISTS bid_subcontractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  declined_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(bid_request_id, subcontractor_id)
);

-- Create bid_responses table
CREATE TABLE IF NOT EXISTS bid_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_request_id UUID NOT NULL REFERENCES bid_requests(id) ON DELETE CASCADE,
  subcontractor_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  notes TEXT,
  estimated_duration INTEGER,
  estimated_start_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(bid_request_id, subcontractor_id)
);

-- Create bid_response_items table
CREATE TABLE IF NOT EXISTS bid_response_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_response_id UUID NOT NULL REFERENCES bid_responses(id) ON DELETE CASCADE,
  bid_item_id UUID NOT NULL REFERENCES bid_items(id) ON DELETE CASCADE,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(bid_response_id, bid_item_id)
);

-- Create bid_attachments table
CREATE TABLE IF NOT EXISTS bid_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bid_request_id UUID REFERENCES bid_requests(id) ON DELETE CASCADE,
  bid_response_id UUID REFERENCES bid_responses(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT bid_attachments_source_check CHECK (
    (bid_request_id IS NOT NULL AND bid_response_id IS NULL) OR
    (bid_request_id IS NULL AND bid_response_id IS NOT NULL)
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_bid_requests_project_id ON bid_requests(project_id);
CREATE INDEX IF NOT EXISTS idx_bid_requests_estimate_id ON bid_requests(estimate_id);
CREATE INDEX IF NOT EXISTS idx_bid_requests_change_order_id ON bid_requests(change_order_id);
CREATE INDEX IF NOT EXISTS idx_bid_items_bid_request_id ON bid_items(bid_request_id);
CREATE INDEX IF NOT EXISTS idx_bid_items_estimate_line_item_id ON bid_items(estimate_line_item_id);
CREATE INDEX IF NOT EXISTS idx_bid_items_change_order_line_item_id ON bid_items(change_order_line_item_id);
CREATE INDEX IF NOT EXISTS idx_bid_subcontractors_bid_request_id ON bid_subcontractors(bid_request_id);
CREATE INDEX IF NOT EXISTS idx_bid_subcontractors_subcontractor_id ON bid_subcontractors(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_bid_responses_bid_request_id ON bid_responses(bid_request_id);
CREATE INDEX IF NOT EXISTS idx_bid_responses_subcontractor_id ON bid_responses(subcontractor_id);
CREATE INDEX IF NOT EXISTS idx_bid_response_items_bid_response_id ON bid_response_items(bid_response_id);
CREATE INDEX IF NOT EXISTS idx_bid_response_items_bid_item_id ON bid_response_items(bid_item_id);

-- Add trade_category column to people table for subcontractors
ALTER TABLE people ADD COLUMN IF NOT EXISTS trade_categories TEXT[];

-- Add bid_related columns to estimate_line_items
ALTER TABLE estimate_line_items ADD COLUMN IF NOT EXISTS trade_category VARCHAR(100);
ALTER TABLE estimate_line_items ADD COLUMN IF NOT EXISTS has_bids BOOLEAN DEFAULT FALSE;

-- Add bid_related columns to change_order_line_items
ALTER TABLE change_order_line_items ADD COLUMN IF NOT EXISTS trade_category VARCHAR(100);
ALTER TABLE change_order_line_items ADD COLUMN IF NOT EXISTS has_bids BOOLEAN DEFAULT FALSE;

-- Create enum type for bid statuses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_status') THEN
        CREATE TYPE bid_status AS ENUM (
            'draft', 
            'sent', 
            'viewed', 
            'responded', 
            'awarded', 
            'declined', 
            'expired', 
            'cancelled'
        );
    END IF;
END$$;

-- Create enum type for bid response statuses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bid_response_status') THEN
        CREATE TYPE bid_response_status AS ENUM (
            'submitted', 
            'under_review', 
            'clarification_needed', 
            'accepted', 
            'rejected'
        );
    END IF;
END$$;

-- Create enum type for trade categories if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'trade_category') THEN
        CREATE TYPE trade_category AS ENUM (
            'general', 
            'electrical', 
            'plumbing', 
            'hvac', 
            'carpentry', 
            'masonry', 
            'roofing', 
            'flooring', 
            'painting', 
            'landscaping', 
            'concrete', 
            'drywall', 
            'insulation', 
            'windows_doors', 
            'siding', 
            'cleaning', 
            'demolition', 
            'excavation', 
            'other'
        );
    END IF;
END$$;
