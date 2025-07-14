-- Create table to store daily sequence numbers for estimates
CREATE TABLE public.estimate_daily_sequences (
    sequence_date DATE PRIMARY KEY,
    last_sequence_number INT NOT NULL DEFAULT 0
);

-- Create or replace the function to set the estimate number
CREATE OR REPLACE FUNCTION public.set_estimate_number()
RETURNS TRIGGER AS $$
DECLARE
    current_date_str TEXT;
    next_sequence_val INT;
BEGIN
    IF NEW.estimate_number IS NULL THEN
        current_date_str := to_char(now(), 'YYYYMMDD');

        INSERT INTO public.estimate_daily_sequences (sequence_date, last_sequence_number)
        VALUES (CURRENT_DATE, 1)
        ON CONFLICT (sequence_date) DO UPDATE
        SET last_sequence_number = estimate_daily_sequences.last_sequence_number + 1
        RETURNING last_sequence_number INTO next_sequence_val;

        NEW.estimate_number := 'EST-' || current_date_str || '-' || next_sequence_val;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists to avoid conflicts when recreating
DROP TRIGGER IF EXISTS set_estimate_number_trigger ON public.estimates;

-- Create the trigger to call the function before insert or update on estimates
CREATE TRIGGER set_estimate_number_trigger
BEFORE INSERT OR UPDATE ON public.estimates
FOR EACH ROW
EXECUTE FUNCTION public.set_estimate_number();
