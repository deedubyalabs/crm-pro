-- Add section field to estimate_line_items
ALTER TABLE public.estimate_line_items 
ADD COLUMN section_name character varying(100) NULL;

-- Add discount fields to estimates
ALTER TABLE public.estimates
ADD COLUMN discount_type character varying(10) NULL CHECK (discount_type IN ('percentage', 'fixed') OR discount_type IS NULL),
ADD COLUMN discount_value numeric(10, 2) NULL DEFAULT 0.00,
ADD COLUMN subtotal_amount numeric(12, 2) NOT NULL DEFAULT 0.00;

-- Create payment schedules table
CREATE TABLE public.estimate_payment_schedules (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  estimate_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric(12, 2) NOT NULL,
  due_type character varying(20) NOT NULL, -- 'on_acceptance', 'on_completion', 'days_after_invoice', 'specific_date'
  due_days integer NULL,
  due_date date NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT estimate_payment_schedules_pkey PRIMARY KEY (id),
  CONSTRAINT estimate_payment_schedules_estimate_id_fkey FOREIGN KEY (estimate_id) REFERENCES estimates (id) ON DELETE CASCADE
);

CREATE INDEX idx_estimate_payment_schedules_estimate_id ON public.estimate_payment_schedules USING btree (estimate_id);

CREATE TRIGGER set_timestamp BEFORE UPDATE ON estimate_payment_schedules
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

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

-- Create user_role enum
CREATE TYPE public.user_role AS ENUM ('Admin', 'Employee', 'Subcontractor');

-- Create users table
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  email character varying(255) NOT NULL,
  hashed_password character varying(255) NOT NULL,
  first_name character varying(100) NULL,
  last_name character varying(100) NULL,
  is_active boolean NOT NULL DEFAULT TRUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  role public.user_role NULL DEFAULT 'Admin'::user_role,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);

CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();
