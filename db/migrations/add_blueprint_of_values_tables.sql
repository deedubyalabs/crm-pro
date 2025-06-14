-- Create blueprint_of_values table
CREATE TABLE IF NOT EXISTS public.blueprint_of_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blueprint_of_value_line_items table
CREATE TABLE IF NOT EXISTS public.blueprint_of_value_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bov_id UUID REFERENCES public.blueprint_of_values(id) ON DELETE CASCADE,
    estimate_line_item_id UUID REFERENCES public.estimate_line_items(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    scheduled_value NUMERIC(10, 2) NOT NULL,
    amount_previously_billed NUMERIC(10, 2) DEFAULT 0,
    remaining_to_bill NUMERIC(10, 2) NOT NULL,
    percent_previously_billed NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add a trigger to update remaining_to_bill when scheduled_value or amount_previously_billed changes
CREATE OR REPLACE FUNCTION update_remaining_to_bill()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_to_bill = NEW.scheduled_value - NEW.amount_previously_billed;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_remaining_to_bill_trigger
BEFORE INSERT OR UPDATE OF scheduled_value, amount_previously_billed ON public.blueprint_of_value_line_items
FOR EACH ROW
EXECUTE FUNCTION update_remaining_to_bill();

-- Add a trigger to update percent_previously_billed when scheduled_value or amount_previously_billed changes
CREATE OR REPLACE FUNCTION update_percent_previously_billed()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.scheduled_value > 0 THEN
        NEW.percent_previously_billed = (NEW.amount_previously_billed / NEW.scheduled_value) * 100;
    ELSE
        NEW.percent_previously_billed = 0;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_percent_previously_billed_trigger
BEFORE INSERT OR UPDATE OF scheduled_value, amount_previously_billed ON public.blueprint_of_value_line_items
FOR EACH ROW
EXECUTE FUNCTION update_percent_previously_billed();
