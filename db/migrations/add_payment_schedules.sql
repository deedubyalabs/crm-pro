-- Create payment schedules table
CREATE TABLE IF NOT EXISTS public.estimate_payment_schedules (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  estimate_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  due_type character varying(20) NOT NULL, -- 'on_acceptance', 'on_completion', 'days_after_acceptance', 'specific_date'
  due_days integer NULL,
  due_date date NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estimate_payment_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT estimate_payment_schedules_estimate_id_fkey FOREIGN KEY (estimate_id) REFERENCES estimates (id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_estimate_payment_schedules_estimate_id ON public.estimate_payment_schedules USING btree (estimate_id);

-- Add trigger for automatic timestamp updates
CREATE OR REPLACE TRIGGER set_timestamp_estimate_payment_schedules
BEFORE UPDATE ON public.estimate_payment_schedules
FOR EACH ROW
EXECUTE FUNCTION public.trigger_set_timestamp();

-- Add columns to estimates table for deposit requirements
ALTER TABLE public.estimates
ADD COLUMN IF NOT EXISTS requires_deposit boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_percentage numeric(5, 2) NULL,
ADD COLUMN IF NOT EXISTS deposit_amount numeric(12, 2) NULL;
