-- Create bigbox_product_mappings table
CREATE TABLE IF NOT EXISTS public.bigbox_product_mappings (
  id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  cost_item_id UUID NOT NULL REFERENCES public.cost_items(id) ON DELETE CASCADE,
  bigbox_product_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add sync_with_bigbox column to cost_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cost_items' AND column_name = 'sync_with_bigbox'
  ) THEN
    ALTER TABLE public.cost_items ADD COLUMN sync_with_bigbox BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Add last_price_sync column to cost_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cost_items' AND column_name = 'last_price_sync'
  ) THEN
    ALTER TABLE public.cost_items ADD COLUMN last_price_sync TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- Create trigger for updated_at
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.bigbox_product_mappings
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bigbox_product_mappings_cost_item_id ON public.bigbox_product_mappings(cost_item_id);
CREATE INDEX IF NOT EXISTS idx_bigbox_product_mappings_product_id ON public.bigbox_product_mappings(bigbox_product_id);
CREATE INDEX IF NOT EXISTS idx_bigbox_product_mappings_store_id ON public.bigbox_product_mappings(store_id);
