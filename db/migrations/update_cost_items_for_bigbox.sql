-- Remove Home Depot specific columns
ALTER TABLE cost_items DROP COLUMN IF EXISTS sync_with_home_depot;

-- Ensure BigBox columns exist
ALTER TABLE cost_items ADD COLUMN IF NOT EXISTS sync_with_bigbox BOOLEAN DEFAULT false;
ALTER TABLE cost_items ADD COLUMN IF NOT EXISTS last_price_sync TIMESTAMP WITH TIME ZONE;

-- Drop Home Depot mappings table if it exists
DROP TABLE IF EXISTS home_depot_product_mappings;

-- Make sure BigBox mappings table exists
CREATE TABLE IF NOT EXISTS bigbox_product_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cost_item_id UUID NOT NULL REFERENCES cost_items(id) ON DELETE CASCADE,
  bigbox_product_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_bigbox_product_mappings_cost_item_id ON bigbox_product_mappings(cost_item_id);
